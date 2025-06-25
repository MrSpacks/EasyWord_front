<script lang="ts">
  import { onMount } from "svelte";
  import {
    login,
    getDictionaries,
    register,
    type Dictionary,
    type Word,
  } from "$lib/api";
  import { accessToken, isAuthenticated } from "$lib/stores/authStore";
  // import { createWord } from "$lib/api";
  let dictionaries: Dictionary[] = [];
  let isLoading = true;
  let error: string | null = null;
  let words: Word[] = [];

  // Вход
  let username = "";
  let password = "";

  // Регистрация
  let registerUsername = "";
  let registerPassword = "";

  async function handleLogin() {
    //Функция для обработки входа пользователя
    isLoading = true;
    try {
      const authData = await login(username, password); // Вызов API для входа
      accessToken.set(authData.access);
      isAuthenticated.set(true);
      localStorage.setItem("accessToken", authData.access);
      dictionaries = await getDictionaries(authData.access);
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
      isAuthenticated.set(false);
    } finally {
      isLoading = false;
    }
  }

  async function handleRegister() {
    // Функция для обработки регистрации пользователя
    isLoading = true;
    try {
      await register(registerUsername, registerPassword); // Вызов API для регистрации
      username = registerUsername;
      password = registerPassword;
      await handleLogin();
    } catch (e) {
      error = e instanceof Error ? e.message : "Неизвестная ошибка";
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    // Проверка наличия токена в localStorage при загрузке страницы
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        dictionaries = await getDictionaries(token);
        accessToken.set(token);
        isAuthenticated.set(true);
      } catch (e) {
        localStorage.removeItem("accessToken");
        isAuthenticated.set(false);
      } finally {
        isLoading = false;
      }
    } else {
      isLoading = false;
    }
  });
</script>

<main>
  <h1>Словари Easy Words</h1>

  {#if isLoading}
    <p>Загрузка...</p>
  {:else if !$isAuthenticated}
    <!-- Форма входа -->
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
    <!-- Контент для авторизованных -->
    {#if dictionaries.length > 0}
      <select>
        <option disabled selected>Выберите словарь</option>
        {#each dictionaries as dictionary}
          <option value={dictionary.id}>{dictionary.name}</option>
        {/each}
      </select>
      <p>Выберите словарь из списка выше, чтобы начать изучение слов.</p>
      <ul>
        {#each words as word}
          <li>{word.original_word} - {word.translated_word}</li>
        {/each}
      </ul>
      <!-- </select>
      <ul>
        {#each dictionaries as dictionary}
          <li>{dictionary.name}</li>
        {/each}
      </ul> -->
    {:else}
      <p>У вас пока нет ни одного словаря. Пора создать новый!</p>
    {/if}
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
</style>
