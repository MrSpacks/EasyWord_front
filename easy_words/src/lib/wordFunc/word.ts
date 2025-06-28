import { type Word, type Dictionary } from "$lib/api";
import { getDictionaries } from "$lib/api";
import { accessToken, isAuthenticated } from "../stores/authStore"; // Add this import

let dictionaries: Dictionary[] = [];
let isLoading = true;
let error: string | null = null;
let words: Word[] = [];
let selectedDictionaryId: number = 0;
export async function handleSelectChange() {
  if (selectedDictionaryId === 0) {
    words = [];
    return;
  }

  localStorage.setItem("lastDictionaryId", selectedDictionaryId.toString());
  await fetchWords(selectedDictionaryId);
}

export async function fetchWords(dictionaryId: number) {
  words = [];
  isLoading = true;
  error = null;

  if (dictionaryId === 0) {
    isLoading = false;
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Пользователь не авторизован");

    const response = await fetch(
      `http://localhost:8000/app/words/?dictionary=${dictionaryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Не удалось загрузить слова");

    const data = await response.json();

    // Если сервер не фильтрует, фильтруем сами:
    words = data.filter((w: Word) => w.dictionary === dictionaryId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Неизвестная ошибка";
    words = [];
  } finally {
    isLoading = false;
  }
}
export async function onMount() {
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      dictionaries = await getDictionaries(token);
      accessToken.set(token);
      isAuthenticated.set(true);

      await selectInitialDictionary();
    } catch (e) {
      localStorage.removeItem("accessToken");
      isAuthenticated.set(false);
    } finally {
      isLoading = false;
    }
  } else {
    isLoading = false;
  }
}

export async function selectInitialDictionary() {
  const lastDictionaryId = parseInt(
    localStorage.getItem("lastDictionaryId") || "0"
  );
  const found = dictionaries.find((d) => d.id === lastDictionaryId);

  if (found) {
    selectedDictionaryId = found.id;
    await fetchWords(selectedDictionaryId);
  } else if (dictionaries.length > 0) {
    selectedDictionaryId = dictionaries[0].id;
    await fetchWords(selectedDictionaryId);
  }
}
