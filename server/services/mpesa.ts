import { AppError } from '../errors.ts';
import { env } from '../env.ts';
import { getOptionalDocument, setDocument } from './data-provider.ts';
import { createNotification } from '../routes/notifications.ts';
import type { WithdrawalRecord } from '../types.ts';
import { toDarajaMsisdn } from '../utils/phone.ts';

type MpesaAuthResponse = {
  access_token?: string;
};

type MpesaB2CResponse = {
  ResponseCode?: string;
  ResponseDescription?: string;
  ConversationID?: string;
  OriginatorConversationID?: string;
};

type MpesaCallbackParameter = {
  Key?: string;
  Value?: unknown;
};

type MpesaResultPayload = {
  Result?: {
    ResultCode?: number | string;
    ResultDesc?: string;
    ConversationID?: string;
    OriginatorConversationID?: string;
    TransactionID?: string;
    ResultParameters?: {
      ResultParameter?: MpesaCallbackParameter[];
    };
  };
  OriginatorConversationID?: string;
  ConversationID?: string;
  ResultCode?: number | string;
  ResultDesc?: string;
  TransactionID?: string;
};

type InitiateMpesaWithdrawalInput = {
  withdrawalId: string;
  amount: number;
  phoneNumber: string;
};

type InitiateMpesaWithdrawalResult = {
  providerRequestId: string;
  providerStatus: string;
  providerMetadata: Record<string, unknown>;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

const MPESA_ACCESS_TOKEN_TTL_MS = 55 * 60 * 1000;

const getMpesaBaseUrl = () =>
  env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const buildMpesaRequestId = (withdrawalId: string) => `withdrawal:${withdrawalId}`;

const parseMpesaRequestId = (value?: string | null) => {
  if (!value?.startsWith('withdrawal:')) {
    return null;
  }

  return value.slice('withdrawal:'.length);
};

const getCallbackUrl = (path: string) => new URL(path, env.APP_URL).toString();

const getMpesaToken = async () => {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  const credentials = Buffer.from(
    `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`,
    'utf8',
  ).toString('base64');

  const response = await fetch(
    `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  const payload = (await response.json().catch(() => ({}))) as MpesaAuthResponse & {
    errorMessage?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new AppError(
      payload.errorMessage || 'Unable to authenticate with M-Pesa.',
      502,
      'upstream_error',
    );
  }

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + MPESA_ACCESS_TOKEN_TTL_MS,
  };

  return payload.access_token;
};

const extractCallbackParameters = (
  parameters: MpesaCallbackParameter[] | undefined,
): Record<string, unknown> => {
  return Object.fromEntries(
    (parameters || [])
      .filter((parameter) => parameter.Key)
      .map((parameter) => [parameter.Key as string, parameter.Value]),
  );
};

const persistMpesaOutcome = async ({
  withdrawalId,
  status,
  providerStatus,
  statusReason,
  providerTransactionId,
  providerMetadata,
}: {
  withdrawalId: string;
  status: 'paid' | 'failed';
  providerStatus: string;
  statusReason?: string;
  providerTransactionId?: string;
  providerMetadata: Record<string, unknown>;
}) => {
  const existing = await getOptionalDocument<WithdrawalRecord>(`withdrawals/${withdrawalId}`, '');
  if (!existing) {
    return false;
  }

  const timestamp = new Date().toISOString();
  const alreadyTerminal = existing.status === 'paid' || existing.status === 'failed';

  await setDocument(
    `withdrawals/${withdrawalId}`,
    {
      status,
      providerStatus,
      providerTransactionId,
      providerUpdatedAt: timestamp,
      providerMetadata,
      statusReason,
      updatedAt: timestamp,
    },
    '',
    { merge: true },
  );

  if (!alreadyTerminal) {
    await createNotification({
      userId: existing.userId,
      type: status === 'paid' ? 'withdrawal_paid' : 'withdrawal_failed',
      title: status === 'paid' ? 'Withdrawal paid' : 'Withdrawal failed',
      body:
        status === 'paid'
          ? `Your ${existing.provider} withdrawal for ${existing.currency} ${existing.amount} was confirmed by M-Pesa.`
          : statusReason ||
            `Your ${existing.provider} withdrawal for ${existing.currency} ${existing.amount} needs attention from operations.`,
      relatedId: withdrawalId,
    }).catch(() => null);
  }

  return true;
};

export const initiateMpesaWithdrawal = async ({
  withdrawalId,
  amount,
  phoneNumber,
}: InitiateMpesaWithdrawalInput): Promise<InitiateMpesaWithdrawalResult> => {
  if (!env.mpesaConfigured) {
    throw new AppError('M-Pesa payouts are not fully configured.', 503, 'not_configured');
  }

  const msisdn = toDarajaMsisdn(phoneNumber);
  if (!msisdn) {
    throw new AppError('Enter a valid Kenyan mobile number for M-Pesa withdrawals.', 400, 'bad_request');
  }

  const token = await getMpesaToken();
  const providerRequestId = buildMpesaRequestId(withdrawalId);

  const response = await fetch(`${getMpesaBaseUrl()}${env.MPESA_B2C_ENDPOINT}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      OriginatorConversationID: providerRequestId,
      InitiatorName: env.MPESA_INITIATOR_NAME,
      SecurityCredential: env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: env.MPESA_SHORTCODE,
      PartyB: msisdn,
      Remarks: `DentSide withdrawal ${withdrawalId}`,
      QueueTimeOutURL: getCallbackUrl('/api/webhooks/mpesa/timeout'),
      ResultURL: getCallbackUrl('/api/webhooks/mpesa/result'),
      Occasion: 'DentSide withdrawal',
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as MpesaB2CResponse & {
    errorMessage?: string;
    errorCode?: string;
  };

  if (!response.ok || payload.ResponseCode !== '0') {
    throw new AppError(
      payload.errorMessage || payload.ResponseDescription || 'M-Pesa rejected the payout request.',
      502,
      'upstream_error',
    );
  }

  return {
    providerRequestId,
    providerStatus: payload.ResponseDescription || 'queued',
    providerMetadata: {
      conversationId: payload.ConversationID,
      originatorConversationId: payload.OriginatorConversationID,
      responseCode: payload.ResponseCode,
      responseDescription: payload.ResponseDescription,
    },
  };
};

export const handleMpesaResultCallback = async (payload: MpesaResultPayload) => {
  const result = payload.Result || payload;
  const providerRequestId =
    result.OriginatorConversationID || payload.OriginatorConversationID || null;
  const withdrawalId = parseMpesaRequestId(providerRequestId);

  if (!withdrawalId) {
    return false;
  }

  const resultParameters = extractCallbackParameters(
    'ResultParameters' in result ? result.ResultParameters?.ResultParameter : undefined,
  );
  const resultCode = Number(result.ResultCode ?? 1);
  const status = resultCode === 0 ? 'paid' : 'failed';
  const statusReason = result.ResultDesc || `M-Pesa callback result ${resultCode}`;

  return persistMpesaOutcome({
    withdrawalId,
    status,
    providerStatus: statusReason,
    statusReason,
    providerTransactionId:
      (typeof resultParameters.TransactionReceipt === 'string'
        ? resultParameters.TransactionReceipt
        : undefined) || result.TransactionID,
    providerMetadata: {
      raw: payload as Record<string, unknown>,
      resultCode,
      conversationId: result.ConversationID,
      originatorConversationId: providerRequestId,
      parameters: resultParameters,
    },
  });
};

export const handleMpesaTimeoutCallback = async (payload: MpesaResultPayload) => {
  const result = payload.Result || payload;
  const providerRequestId =
    result.OriginatorConversationID || payload.OriginatorConversationID || null;
  const withdrawalId = parseMpesaRequestId(providerRequestId);

  if (!withdrawalId) {
    return false;
  }

  return persistMpesaOutcome({
    withdrawalId,
    status: 'failed',
    providerStatus: 'timeout',
    statusReason: result.ResultDesc || 'M-Pesa payout request timed out.',
    providerTransactionId: result.TransactionID,
    providerMetadata: {
      raw: payload as Record<string, unknown>,
      conversationId: result.ConversationID,
      originatorConversationId: providerRequestId,
    },
  });
};
