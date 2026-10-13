import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { ApiErrorResponse } from '@flowpilot/schemas';

export function createApiErrorResponse(
  code: string,
  message: string,
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly publicMessage: string;

  constructor(statusCode: number, code: string, publicMessage: string) {
    super(publicMessage);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export function appErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply
      .code(error.statusCode)
      .send(createApiErrorResponse(error.code, error.publicMessage));
  }

  const statusCode = error.statusCode;

  if (
    typeof error.code === 'string' &&
    error.code.startsWith('FST_ERR_') &&
    typeof statusCode === 'number' &&
    statusCode >= 400 &&
    statusCode < 500
  ) {
    return reply
      .code(statusCode)
      .send(createApiErrorResponse('invalid_request', 'Invalid request.'));
  }

  request.log.error({ err: error }, 'Unhandled request error');

  return reply
    .code(500)
    .send(
      createApiErrorResponse(
        'internal_server_error',
        'Something went wrong. Please try again.',
      ),
    );
}
