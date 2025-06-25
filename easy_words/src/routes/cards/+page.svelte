<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { isAuthenticated } from "$lib/stores/authStore";
  import { get } from "svelte/store";

  let isLoading = true;

  onMount(() => {
    const auth = get(isAuthenticated);
    if (!auth) {
      // перенаправляем на главную
      goto("/");
    } else {
      isLoading = false;
    }
  });
</script>

<main>
  {#if isLoading}
    <p>Загрузка...</p>
  {:else}
    <h1>Личный кабинет</h1>
    <p>Добро пожаловать!</p>
  {/if}
</main>
