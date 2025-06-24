
// Определяем типы данных, которые мы ожидаем получить от нашего API.
// Это очень помогает для автодополнения и поиска ошибок.
export interface Dictionary {
  id: number; // ID словаря
  name: string; // Название словаря
  created_at: string; // Даты приходят как строки в JSON
  owner: string;
  words: any[]; // Пока оставим тип any, позже можно создать интерфейс для слов
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

const BASE_URL = "http://localhost:8000/app";

/**
 * Универсальная функция для отправки запросов к нашему Django API.
 * @param endpoint - Путь к API эндпоинту (например, '/dictionaries/').
 * @param method - HTTP метод ('GET', 'POST', и т.д.).
 * @param data - Объект с данными для отправки (для POST/PUT запросов).
 * @param token - JWT токен для аутентификации.
 * @returns - Промис с данными ответа в формате JSON.
 */
async function apiFetch(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data: Record<string, any> | null = null,
  token: string | null = null
) {
  // RequestInit - это встроенный тип TypeScript для опций fetch
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    // Теперь TypeScript знает, что headers - это объект, куда можно добавлять свойства
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.detail || "Что-то пошло не так");
  }

  if (response.status === 204) {
    // No Content
    return null;
  }

  return response.json();
}

// --- Функции для взаимодействия с API ---

/**
 * Отправляет логин и пароль для получения токенов доступа.
 * @param username - Имя пользователя.
 * @param password - Пароль.
 * @returns Промис, который разрешается объектом с access и refresh токенами.
 */
export function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch("/token/", "POST", { username, password });
}
export async function logout() {
  // Просто удаляем токен из localStorage и store
  localStorage.removeItem("accessToken");
}
/**
 * Получает список словарей для аутентифицированного пользователя.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается массивом словарей.
 */
export function getDictionaries(token: string): Promise<Dictionary[]> {
  return apiFetch("/dictionaries/", "GET", null, token);
}

export async function register(username: string, password: string): Promise<void> {
  const response = await fetch("http://localhost:8000/app/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error || "Ошибка регистрации");
  }
}