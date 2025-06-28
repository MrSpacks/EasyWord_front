<script lang="ts">
  import {
    login,
    getDictionaries,
    register,
    type Dictionary,
    type Word,
  } from "$lib/api";
  import { accessToken, isAuthenticated } from "$lib/stores/authStore";
  import {
    fetchWords,
    handleSelectChange,
    selectInitialDictionary,
  } from "$lib/wordFunc/word";
  import type { on } from "svelte/events";

  let dictionaries: Dictionary[] = [];
  let isLoading = true;
  let error: string | null = null;
  let words: Word[] = [];

  let username = "";
  let password = "";

  let registerUsername = "";
  let registerPassword = "";

  let selectedDictionaryId: number = 0;

  async function handleLogin() {
    isLoading = true;
    try {
      const authData = await login(username, password);
      accessToken.set(authData.access);
      isAuthenticated.set(true);
      localStorage.setItem("accessToken", authData.access);
      dictionaries = await getDictionaries(authData.access);

      await selectInitialDictionary();
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
      isAuthenticated.set(false);
    } finally {
      isLoading = false;
    }
  }

  async function handleRegister() {
    isLoading = true;
    try {
      await register(registerUsername, registerPassword);
      username = registerUsername;
      password = registerPassword;
      await handleLogin();
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
    } finally {
      isLoading = false;
    }
  }

  let showEditModal = false;
  let editWord: Word | null = null;
  let editOriginal = "";
  let editTranslation = "";
  let editCount = 0;

  async function deleteWord(wordId: number) {
    if (!confirm("Вы уверены, что хотите удалить это слово?")) return;

    isLoading = true;
    error = null;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Пользователь не авторизован");

      const response = await fetch(
        `http://localhost:8000/app/words/${wordId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Не удалось удалить слово");

      // Обновляем список слов после удаления
      words = words.filter((w) => w.id !== wordId);
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
    } finally {
      isLoading = false;
    }
  }

  function handleWordEdit(wordId: number) {
    const word = words.find((w) => w.id === wordId);
    if (!word) return;

    editWord = word;
    editOriginal = word.original_word;
    editTranslation = word.translated_word;
    editCount = word.count || 0; // Предполагаем, что поле count может быть в слове
    showEditModal = true;
  }

  async function saveWordEdit() {
    if (!editWord) return;

    isLoading = true;
    error = null;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Пользователь не авторизован");

      const response = await fetch(
        `http://localhost:8000/app/words/${editWord.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            original_word: editOriginal,
            translated_word: editTranslation,
            count: editCount,
          }),
        }
      );

      if (!response.ok) throw new Error("Не удалось сохранить изменения");

      const updated = await response.json();

      // Обновляем локальный список
      words = words.map((w) => (w.id === updated.id ? updated : w));

      showEditModal = false;
      editWord = null;
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
    } finally {
      isLoading = false;
    }
  }

  function closeEditModal() {
    showEditModal = false;
    editWord = null;
  }
</script>

<main>
  <h1>Словари Easy Words</h1>

  {#if isLoading}
    <p>Загрузка...</p>
  {:else if !$isAuthenticated}
    <h2>Вход в систему</h2>
    <p>
      Пожалуйста, войдите в систему или зарегистрируйтесь, чтобы продолжить.
    </p>
    <form on:submit|preventDefault={handleLogin}>
      <input type="text" bind:value={username} placeholder="Имя пользователя" />
      <input type="password" bind:value={password} placeholder="Пароль" />
      <button type="submit">Войти</button>
    </form>

    <h2>Регистрация</h2>
    <form on:submit|preventDefault={handleRegister}>
      <input
        type="text"
        bind:value={registerUsername}
        placeholder="Имя пользователя"
      />
      <input
        type="password"
        bind:value={registerPassword}
        placeholder="Пароль"
      />
      <button type="submit">Зарегистрироваться</button>
    </form>

    {#if error}
      <p style="color: red;">Ошибка: {error}</p>
    {/if}
  {:else}
    {#if dictionaries.length > 0}
      <h2>Ваши словари</h2>
      <select bind:value={selectedDictionaryId} on:change={handleSelectChange}>
        <option value="0" disabled>Выберите словарь</option>
        {#each dictionaries as dictionary}
          <option value={dictionary.id}>{dictionary.name}</option>
        {/each}
      </select>

      {#if words.length > 0}
        <ul>
          {#each words as word}
            <li>
              <strong>{word.original_word}</strong> — {word.translated_word}
              <button on:click={() => handleWordEdit(word.id)}>изменить</button>
              <button on:click={() => deleteWord(word.id)}>удалить</button>
            </li>
          {/each}
        </ul>
      {:else}
        <p>Этот словарь пока пуст. Добавьте в него слова!</p>
      {/if}
    {:else}
      <p>У вас пока нет ни одного словаря. Пора создать новый!</p>
    {/if}

    {#if error}
      <p style="color: red;">Ошибка: {error}</p>
    {/if}
  {/if}
  <!-- Modal for editing word -->
  {#if showEditModal}
    <div class="modal-backdrop">
      <div class="modal">
        <h3>Редактировать слово</h3>
        <label>
          Оригинал:
          <input type="text" bind:value={editOriginal} />
        </label>
        <label>
          Перевод:
          <input type="text" bind:value={editTranslation} />
        </label>
        <label>
          Количество:
          <input type="number" bind:value={editCount} min="0" />
        </label>
        <div class="modal-buttons">
          <button on:click={saveWordEdit}>Сохранить</button>
          <button on:click={closeEditModal}>Отмена</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 600px;
    margin: 2rem auto;
  }

  input {
    display: block;
    margin-bottom: 0.5rem;
    width: 100%;
    padding: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
  }

  select {
    margin: 1rem 0;
    padding: 0.5rem;
    width: 100%;
  }
  /* modal style */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
  }

  .modal label {
    display: block;
    margin-bottom: 1rem;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
</style>
