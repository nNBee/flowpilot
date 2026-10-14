import {
  apiErrorResponseSchema,
  type ApiErrorResponse,
} from '@flowpilot/schemas';
import { config } from '../../config';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseApiError(
  response: Response,
): Promise<ApiErrorResponse | null> {
  try {
    const body: unknown = await response.json();
    const result = apiErrorResponseSchema.safeParse(body);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function apiRequest(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${path}`, options);
  } catch {
    throw new ApiError(
      0,
      'network_error',
      'Unable to reach the server. Please try again.',
    );
  }

  if (response.ok) {
    return response;
  }

  const apiError = await parseApiError(response);

  if (apiError) {
    throw new ApiError(
      response.status,
      apiError.error.code,
      apiError.error.message,
    );
  }

  throw new ApiError(
    response.status,
    'unexpected_response',
    'Something went wrong. Please try again.',
  );
}
