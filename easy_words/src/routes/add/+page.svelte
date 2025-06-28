<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { isAuthenticated } from "$lib/stores/authStore";
  import { get } from "svelte/store";
  import { getDictionaries, type Dictionary } from "$lib/api";
  import { accessToken } from "$lib/stores/authStore";
  import { createWord } from "$lib/api";

  let isLoading = true;
  let dictionaries: Dictionary[] = [];

  onMount(async () => {
    const auth = get(isAuthenticated);
    if (!auth) {
      goto("/");
      return;
    }

    const token = get(accessToken)!;
    try {
      dictionaries = await getDictionaries(token);
    } catch (e) {
      console.error("Ошибка при загрузке словарей:", e);
    } finally {
      isLoading = false;
    }
  });
  async function AddWord() {
    const original_word = (
      document.getElementById("AddWord") as HTMLInputElement
    ).value;
    const translated_word = (
      document.getElementById("translation") as HTMLInputElement
    ).value;
    const dictionaryId = parseInt(
      (document.getElementById("dictionaryId") as HTMLSelectElement).value
    );
    const image = (document.getElementById("image") as HTMLInputElement)
      ?.files?.[0];
    // Костыль для добавления изображения
    // В реальном приложении нужно использовать более надежный способ получения файла
    // Например, можно использовать библиотеку для работы с файлами или API браузера
    // Здесь мы просто берем первый файл из input
    // и преобразуем его в base64 строку
    // const imageValue: string | null = image ? await fileToBase64(image) : null;
    // Вспомогательная функция для преобразования файла в base64
    // async function fileToBase64(file: File): Promise<string> {
    //   return new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = () => resolve(reader.result as string);
    //     reader.onerror = reject;
    //     reader.readAsDataURL(file);
    //   });
    // }
    try {
      const token = get(accessToken)!;
      const newWord = await createWord(
        dictionaryId,
        original_word,
        translated_word,
        image ? image.name : null, // Здесь можно использовать imageValue если реализовано добавление изображений
        token
      );
      alert("Слово успешно добавлено!");
    } catch (err) {
      alert(
        "Не удалось добавить слово: " +
          (err instanceof Error ? err.message : "Неизвестная ошибка")
      );
    }
  }
</script>

<main>
  {#if isLoading}
    <p>Загрузка...</p>
  {:else}
    <h1>Добавить слово</h1>
    <form on:submit|preventDefault={AddWord}>
      <label for="AddWord">слово</label>
      <input type="text" id="AddWord" name="AddWord" required />
      <label for="translation">перевод</label>
      <input type="text" id="translation" name="translation" required />
      <!-- Функция добавления изображений добавлена но не работает -->
      <!-- <label for="image">Изображение (необязательно)</label> -->
      <!-- <input type="file" id="image" name="image" /> -->
      <label for="dictionaryId">Словарь</label>
      <select id="dictionaryId" name="dictionaryId" required>
        <option value="" disabled selected>Выберите словарь</option>
        {#each dictionaries as dict}
          <option value={dict.id}>{dict.name}</option>
        {/each}
      </select>
      <button type="submit">Добавить</button>
    </form>
  {/if}
</main>
