export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function throwIfError(error: any): never {
  throw new ApiError(error?.message ?? "Unknown database error");
}
