// utils/api.ts

import { auth } from '../../utils/auth';

const API_BASE_URL = 'http://localhost:8000';

// Список защищенных эндпоинтов, требующих авторизации
const PROTECTED_ENDPOINTS = [
  '/api/v1/me/basket-items',
  '/api/v1/me/basket-items/',
  '/api/v1/me/basket-items/'
];

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

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      isProtected: PROTECTED_ENDPOINTS.some(e => endpoint.startsWith(e))
    });

    const needsAuth = PROTECTED_ENDPOINTS.some(protectedEndpoint => 
      endpoint.startsWith(protectedEndpoint)
    );

    let headers = new Headers();

    if (endpoint.endsWith('images/')) {
      headers = new Headers({
        ...(options.headers as Record<string, string> || {})
      });
    } 
    else {
      headers = new Headers({
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      });
    }

    if (needsAuth) {
      const token = auth.getToken();
      console.log('Using token:', token ? 'Present' : 'Missing');
      if (!token) {
        throw new Error('Требуется авторизация');
      }
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // Пытаемся получить тело ошибки, только если оно есть
      const errorText = await response.text();
      let errorData;
      try {
        errorData = errorText ? JSON.parse(errorText) : { message: response.statusText };
      } catch {
        errorData = { message: errorText || response.statusText };
      }

      console.error('API Error:', errorData);
      
      if (response.status === 401) {
        auth.removeTokens();
        throw new Error('Сессия истекла. Пожалуйста, авторизуйтесь заново');
      }
      
      throw new Error(JSON.stringify(errorData));
    }

    // Для DELETE запросов возвращаем успех без парсинга тела
    if (options.method === 'DELETE') {
      return { success: true } as T;
    }

    // Пытаемся получить тело ответа, только если оно есть
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}