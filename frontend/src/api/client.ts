// Thin fetch wrapper around the Donatly ASP.NET API.
// Centralises base URL, JSON handling and error normalisation.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5029/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Extracts a human-readable message from a failed response.
 * The backend returns either a plain string (BadRequest(ex.Message))
 * or an object like { error: "..." } / { message: "..." }.
 */
async function extractError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `Помилка запиту (${res.status})`;
  try {
    const data = JSON.parse(text);
    if (typeof data === 'string') return data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return text;
  } catch {
    return text;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Не вдалося з’єднатися з сервером. Перевірте, що API запущено.');
  }

  if (!res.ok) {
    throw new ApiError(res.status, await extractError(res));
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
