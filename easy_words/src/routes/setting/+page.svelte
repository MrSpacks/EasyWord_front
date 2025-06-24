<script lang="ts">
  import { goto } from "$app/navigation";

  import { logout } from "$lib/api";
  import { isAuthenticated, accessToken } from "$lib/stores/authStore";

  let error = "";

  async function handleLogout() {
    try {
      await logout(); // чистим localStorage
      accessToken.set(null);
      isAuthenticated.set(false);
      await goto("/"); // перенаправляем на страницу входа
      window.location.href = "/"; // для полной перезагрузки страницы
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      error = "Logout failed: " + errorMessage;
    }
  }
</script>

<div class="container">
  <h2>Выход</h2>
  <button on:click={handleLogout}>Выйти из аккаунта</button>
  {#if error}
    <p style="color: red;">{error}</p>
  {/if}
</div>

<style>
  .container {
    max-width: 600px;
    margin: 2rem auto;
    text-align: center;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
