<script lang="ts">
  import { onMount } from "svelte";
  // 2. Импортируем наши функции и ИНТЕРФЕЙС Dictionary
  import { login, getDictionaries, type Dictionary } from "$lib/api";

  // 3. Явно указываем типы для наших переменных
  let dictionaries: Dictionary[] = [];
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      // ВАЖНО: Не забудьте подставить свои реальные данные
      const authData = await login("ваш_логин", "ваш_пароль");
      const accessToken = authData.access;

      dictionaries = await getDictionaries(accessToken);
    } catch (e) {
      // 4. Правильно обрабатываем ошибку типа 'unknown'
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "Произошла неизвестная ошибка";
      }
    } finally {
      isLoading = false;
    }
  });
</script>

<main>
  <h1>Словари Easy Words</h1>

  {#if isLoading}
    <p>Загрузка...</p>
  {:else if error}
    <p style="color: red;">Ошибка: {error}</p>
  {:else}
    <ul>
      {#each dictionaries as dictionary}
        <li>{dictionary.name} (создан пользователем {dictionary.owner})</li>
      {:else}
        <p>У вас пока нет ни одного словаря. Пора создать новый!</p>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    max-width: 600px;
    margin: 2rem auto;
  }
</style>
