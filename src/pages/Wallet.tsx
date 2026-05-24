import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  apiRequest,
  type WalletSummary,
  type WithdrawalProvider,
  type WithdrawalRecord,
} from '../lib/api';
import { Loader2 } from 'lucide-react';
import DentistLayout from '../components/DentistLayout';

export default function Wallet() {
  const { profile } = useAuth();
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawFormOpen, setIsWithdrawFormOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalProvider, setWithdrawalProvider] = useState<WithdrawalProvider>('stripe');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWallet = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [summary, history] = await Promise.all([
        apiRequest<WalletSummary>('/api/withdraw/summary'),
        apiRequest<WithdrawalRecord[]>('/api/withdraw/history'),
      ]);

      setWalletSummary(summary);
      setWithdrawals(history);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load wallet data right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (withdrawalProvider === 'mpesa' && !destinationAccount && profile?.phoneNumber) {
      setDestinationAccount(profile.phoneNumber);
    }
  }, [destinationAccount, profile?.phoneNumber, withdrawalProvider]);

  const currency = walletSummary?.defaultCurrency || 'USD';
  const payoutCurrency = withdrawalProvider === 'mpesa' ? 'KES' : currency;
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const handleWithdrawalSubmit = async () => {
    setError('');
    setStatusMessage('');

    const amount = Number(withdrawalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid withdrawal amount greater than zero.');
      return;
    }

    if (destinationLabel.trim().length < 3) {
      setError('Enter a destination label with at least 3 characters.');
      return;
    }

    if (withdrawalProvider === 'mpesa' && destinationAccount.trim().length < 10) {
      setError('Enter the M-Pesa number that should receive this payout.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<WithdrawalRecord & { message?: string }>('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          currency: payoutCurrency,
          provider: withdrawalProvider,
          destinationLabel: destinationLabel.trim(),
          destinationAccount:
            withdrawalProvider === 'mpesa' ? destinationAccount.trim() : undefined,
        }),
      });

      setStatusMessage(
        response.message ||
          `${withdrawalProvider === 'mpesa' ? 'M-Pesa' : 'Stripe'} withdrawal request submitted.`,
      );
      setWithdrawalAmount('');
      setDestinationLabel('');
      setDestinationAccount(withdrawalProvider === 'mpesa' ? profile?.phoneNumber || '' : '');
      setIsWithdrawFormOpen(false);
      await loadWallet();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit the withdrawal request right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DentistLayout title="DentSide Finance">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Financial Overview</h1>
          <p className="text-slate-500 font-body max-w-md">Track your clinical earnings, manage payouts, and analyze your remote practice's performance.</p>
        </div>
        {!isWithdrawFormOpen && (
          <button
            onClick={() => setIsWithdrawFormOpen(true)}
            className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold uppercase tracking-wider shadow-[0px_12px_32px_rgba(0,93,144,0.2)] hover:scale-[1.02] transition-all"
          >
            Withdraw Funds
          </button>
        )}
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] flex flex-col justify-between overflow-hidden relative group min-h-[240px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Available Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-on-surface tracking-tighter font-headline">
                {formatMoney(walletSummary?.availableBalance || 0)}
              </span>
              <span className="text-primary font-bold text-sm">Active practice</span>
            </div>
          </div>
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Lifetime Earnings</p>
              <p className="text-xl font-bold text-on-surface font-headline">{formatMoney(walletSummary?.lifetimeWithdrawn || 0)}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Pending Settlements</p>
              <p className="text-xl font-bold text-on-surface font-headline">{formatMoney(walletSummary?.pendingBalance || 0)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Progress / Target Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle
                className="text-primary transition-all duration-1000"
                cx="64" cy="64" fill="transparent" r="58" stroke="currentColor"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 * (1 - 0.75)}
                strokeLinecap="round" strokeWidth="10"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-on-surface font-headline">75%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Goal</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface font-headline">Monthly Target</h3>
            <p className="text-sm text-slate-500">Practice Growth Track</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form if open */}
      {isWithdrawFormOpen && (
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] border-2 border-primary/10 mb-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-on-surface font-headline">Request Withdrawal</h2>
              <p className="text-sm text-slate-500">Funds will be transferred to your selected payout channel.</p>
            </div>
            <button onClick={() => setIsWithdrawFormOpen(false)} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Amount ({payoutCurrency})</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-8 pr-4 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="0.00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Payout Channel</label>
                <select
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                  value={withdrawalProvider}
                  onChange={(e) => setWithdrawalProvider(e.target.value as WithdrawalProvider)}
                >
                  <option value="stripe">Stripe Connect</option>
                  <option value="mpesa">M-Pesa Mobile</option>
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Destination Account Label</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. My Business Checking"
                  value={destinationLabel}
                  onChange={(e) => setDestinationLabel(e.target.value)}
                />
              </div>
              {withdrawalProvider === 'mpesa' && (
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">M-Pesa Number</label>
                  <input
                    type="tel"
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="07XXXXXXXX"
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value)}
                  />
                </div>
              )}
              <div className="pt-6">
                <button
                  onClick={handleWithdrawalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span className="material-symbols-outlined">send</span>}
                  Confirm Payout
                </button>
              </div>
            </div>
          </div>
          {error && <p className="mt-4 text-error text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span> {error}</p>}
          {statusMessage && <p className="mt-4 text-primary text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> {statusMessage}</p>}
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-on-surface font-headline">Gig History & Payouts</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-surface-container text-on-surface-variant text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-surface-container text-on-surface-variant text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <th className="px-8 py-5">Transaction Details</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-slate-500 font-medium">Loading transaction ledger...</p>
                      </div>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">receipt_long</span>
                      <p className="text-slate-500 font-medium">No payout history found.</p>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((record) => (
                    <tr key={record.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">
                              {record.provider === 'mpesa' ? 'smartphone' : 'credit_card'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">Payout to {record.destinationLabel}</p>
                            <p className="text-xs text-slate-500">
                              {record.provider === 'mpesa'
                                ? record.destinationAccount || 'M-Pesa Mobile'
                                : record.destinationAccount || 'Stripe Transfer'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-600">{new Date(record.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(record.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-on-surface font-headline">
                        {formatMoney(record.amount)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status.replace(/_/g, ' ')}
                        </span>
                        {record.statusReason && (
                          <p className="mt-2 text-[10px] text-slate-500 font-medium max-w-[14rem] ml-auto">
                            {record.statusReason}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && withdrawals.length > 0 && (
            <div className="p-6 bg-surface-container-low/50 flex justify-center">
              <button className="text-sm font-bold text-primary hover:underline">View All Activity</button>
            </div>
          )}
        </div>
      </div>
    </DentistLayout>
  );
}
