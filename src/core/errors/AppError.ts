export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(params: { code: string; message: string; statusCode: number }) {
    super(params.message);
    this.code = params.code;
    this.statusCode = params.statusCode;
  }
}
