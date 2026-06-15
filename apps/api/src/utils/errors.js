export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function badRequest(message, details) {
  return new AppError(400, message, details);
}

export function notFound(message) {
  return new AppError(404, message);
}

export function conflict(message) {
  return new AppError(409, message);
}

export function unprocessable(message) {
  return new AppError(422, message);
}
