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
    const word = (document.getElementById("AddWord") as HTMLInputElement).value;
    const translation = (
      document.getElementById("translation") as HTMLInputElement
    ).value;
    const dictionaryId = parseInt(
      (document.getElementById("dictionaryId") as HTMLSelectElement).value
    );

    try {
      const token = get(accessToken)!;
      const newWord = await createWord(dictionaryId, word, translation, token);
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
