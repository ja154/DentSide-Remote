export type AppErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'upstream_error'
  | 'not_configured'
  | 'conflict'
  | 'internal_error';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AppErrorCode;

  public constructor(message: string, statusCode: number, code: AppErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
