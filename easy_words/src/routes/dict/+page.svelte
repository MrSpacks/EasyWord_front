<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { isAuthenticated } from "$lib/stores/authStore";
  import { get } from "svelte/store";
  import { getDictionaries, type Dictionary } from "$lib/api";
  import { accessToken } from "$lib/stores/authStore";
  import { createDictionary } from "$lib/api";
  import { deleteDictionary } from "$lib/api";
  import { updateDictionary } from "$lib/api";

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

  async function AddDictionary() {
    const dictionaryName = (
      document.getElementById("dictionaryName") as HTMLInputElement
    ).value;

    if (!dictionaryName) {
      alert("Пожалуйста, введите название словаря.");
      return;
    }

    try {
      const token = get(accessToken)!;
      const newDict = await createDictionary(dictionaryName, token);
      dictionaries = [...dictionaries, newDict]; // Добавляем в список
      (document.getElementById("dictionaryName") as HTMLInputElement).value =
        ""; // Очищаем поле ввода
    } catch (err) {
      alert(
        "Не удалось добавить словарь: " +
          (err instanceof Error ? err.message : "Неизвестная ошибка")
      );
    }
  }
  async function updateDict(id: number, newName: string) {
    if (!newName) {
      alert("Пожалуйста, введите новое название словаря.");
      return;
    }

    try {
      const token = get(accessToken)!;
      const updatedDict = await updateDictionary(id, newName, token);
      dictionaries = dictionaries.map((dict) =>
        dict.id === id ? updatedDict : dict
      );
    } catch (err) {
      alert(
        "Не удалось обновить словарь: " +
          (err instanceof Error ? err.message : "Неизвестная ошибка")
      );
    }
  }
  async function deleteDict(id: number) {
    if (!confirm("Вы уверены, что хотите удалить этот словарь?")) {
      return;
    }

    try {
      const token = get(accessToken)!;
      await deleteDictionary(id, token);
      dictionaries = dictionaries.filter((dict) => dict.id !== id);
    } catch (err) {
      alert(
        "Не удалось удалить словарь: " +
          (err instanceof Error ? err.message : "Неизвестная ошибка")
      );
    }
  }
</script>

<main>
  {#if isLoading}
    <p>Загрузка...</p>
  {:else}
    <h1>Добавить словарь</h1>
    <form on:submit|preventDefault={AddDictionary}>
      <label for="dictionaryName">Название словаря:</label>
      <input type="text" id="dictionaryName" name="dictionaryName" required />
      <button type="submit">Добавить</button>
    </form>
    {#if dictionaries.length > 0}
      <ul>
        {#each dictionaries as dictionary}
          <li>
            {dictionary.name}
            <button
              on:click={() =>
                updateDict(
                  dictionary.id,
                  prompt("Новое название:", dictionary.name) || ""
                )}>Изменить</button
            >
            <button on:click={() => deleteDict(dictionary.id)}>Удалить</button>
          </li>
        {/each}
      </ul>
    {:else}
      <p>У вас пока нет ни одного словаря. Пора создать новый!</p>
    {/if}
  {/if}
</main>
