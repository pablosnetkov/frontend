// utils/api.ts

import { auth } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Универсальная функция для обращения к API.
 * @param endpoint - Путь к API (например, `/api/v1/goods/`).
 * @param options - Дополнительные параметры fetch, включая метод, заголовки и тело.
 * @returns Ответ API в формате JSON.
 * @throws Ошибка, если запрос завершился неудачно.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;

    console.log('API Request URL:', url);
    console.log('API Request Options:', {
      ...options,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.log('API Error Data:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('API Response Data:', data);
    return data;
  } catch (error) {
    console.error('API Request Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}