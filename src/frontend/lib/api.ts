/**
 * Wrapper for backend API calls that handles the ApiResponse envelope.
 * Backend always returns: { success, data, errors, message }
 */

type ApiResponse<T> = {
  success: boolean;
  data: T;
  errors: Array<{ message: string }>;
  message: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Array<{ message: string }> = [],
  ) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message || body?.errors?.[0]?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body?.errors ?? []);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}
