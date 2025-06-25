
// Определяем типы данных, которые мы ожидаем получить от нашего API.
// Это очень помогает для автодополнения и поиска ошибок.
export interface Dictionary {
  id: number; // ID словаря
  name: string; // Название словаря
  created_at: string; // Даты приходят как строки в JSON
  owner: string;
}

export interface Word {
  id: number; // ID слова
  dictionary: number; // ID словаря, к которому принадлежит слово
  original_word: string; // Текст слова
  translated_word: string; // Определение слова
  image: string | null; // URL изображения слова (может быть null)
  created_at: string; // Дата создания слова
  count: number; // Количество раз, когда слово было изучено
}
export interface AuthResponse {
  access: string;
  refresh: string;
}

export const BASE_URL = "http://localhost:8000/app";

/**
 * Универсальная функция для отправки запросов к нашему Django API.
 * @param endpoint - Путь к API эндпоинту (например, '/dictionaries/').
 * @param method - HTTP метод ('GET', 'POST', и т.д.).
 * @param data - Объект с данными для отправки (для POST/PUT запросов).
 * @param token - JWT токен для аутентификации.
 * @returns - Промис с данными ответа в формате JSON.
 */
export async function apiFetch(
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
/**
 * Проверяет валидность access токена.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается true, если токен валиден, иначе false.
 */
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

/**
 * Проверяет валидность access токена.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается true, если токен валиден, иначе false.
 */
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
/**
 * Получает список слов для указанного словаря.
 * @param dictionaryId - ID словаря.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается массивом слов.
 */

/**
 * Получает список слов для указанного словаря.
 * @param dictionaryId - ID словаря.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается массивом словарей.
 */
export async function createDictionary(name: string, token: string) {
  const response = await fetch("http://localhost:8000/app/dictionaries/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Ошибка при создании словаря");
  }

  return await response.json();
}
/**
 * Получает список слов для указанного словаря.
 * @param dictionaryId - ID словаря.
 * @param token - Access токен пользователя.
 * @returns Промис, который разрешается массивом словарей.
 */
export async function deleteDictionary(
  dictionaryId: number,
  token: string
): Promise<void> {
  return apiFetch(`/dictionaries/${dictionaryId}/`, "DELETE", null, token);
}
export async function updateDictionary(
  dictionaryId: number,
  name: string,
  token: string
): Promise<Dictionary> {
  const response = await fetch(`http://localhost:8000/app/dictionaries/${dictionaryId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Ошибка при обновлении словаря");
  }

  return await response.json();
}



/**! word API */

/**
 * Получаем список слов из словаря по его ID
 * @param dictionaryId - ID словаря, из которого нужно получить слова
 * @param token - Access токен пользователя
 * @returns Промис, который разрешается массивом слов
 */
export async function getWords(
  dictionaryId: number,
  token: string
): Promise<Word[]> {
  return apiFetch(`/dictionaries/${dictionaryId}/words/`, "GET", null, token);
}

/**
* Создает новое слово в указанном словаре.
* @param dictionaryId - ID словаря, в котором нужно создать слово.
* @param word - Слово для создания.
* @param translation - Перевод слова.    
* @param token - Access токен пользователя.
* @returns Промис, который разрешается созданным словом.
*/
export async function createWord(
  dictionaryId: number,
  word: string,
  translation: string,
  token: string
): Promise<Word> {
  return apiFetch(`/dictionaries/${dictionaryId}/words/`, "POST", { word, translation }, token);
}

/**
* Обновляет существующее слово в указанном словаре.
* @param dictionaryId - ID словаря, в котором нужно обновить слово.
* @param wordId - ID слова для обновления.
* @param word - Обновленное слово.
* @param token - Access токен пользователя.
* @returns Промис, который разрешается обновленным словом.
*/
export async function updateWord(
  dictionaryId: number,
  wordId: number,
  word: Word,
  token: string
): Promise<Word> {
  return apiFetch(`/dictionaries/${dictionaryId}/words/${wordId}/`, "PUT", word, token);
}
/**
* Удаляет слово из указанного словаря.
* @param dictionaryId - ID словаря, из которого нужно удалить слово.
* @param wordId - ID слова для удаления.
* @param token - Access токен пользователя.
* @returns Промис, который разрешается при успешном удалении слова.
*/
export async function deleteWord(
  dictionaryId: number,
  wordId: number,
  token: string
): Promise<void> {
  return apiFetch(`/dictionaries/${dictionaryId}/words/${wordId}/`, "DELETE", null, token);
}             
