<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { isAuthenticated, accessToken } from "$lib/stores/authStore";
  import { get } from "svelte/store";
  import { getDictionaries } from "$lib/api";
  import {
    fetchWords,
    handleSelectChange,
    selectInitialDictionary,
  } from "$lib/wordFunc/word";
  import { type Dictionary, type Word } from "$lib/api";
  let isLoading = true;
  let selectedDictionaryId: number = 0;
  let dictionaries: Dictionary[] = [];
  let words: Word[] = [];
  onMount(async () => {
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
  });

  let flipped = false;
  function toggleFlip() {
    flipped = !flipped;
  }
</script>

<main>
  {#if isLoading}
    <p>Загрузка...</p>
  {:else}
    <div class="container">
      <select bind:value={selectedDictionaryId} onchange={handleSelectChange}>
        <option value="0" disabled>Выберите словарь</option>
        {#each dictionaries as dictionary}
          <option value={dictionary.id}>{dictionary.name}</option>
        {/each}
      </select>

      <button
        class={["card", { flipped }]}
        onclick={() => (flipped = !flipped)}
      >
        <div class="front">
          <span class="symbol">♠</span>
        </div>
        <div class="back">
          <div class="pattern"></div>
        </div>
      </button>
    </div>
  {/if}
</main>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 1em;
    height: 100%;
    align-items: center;
    justify-content: center;
    perspective: 100vh;
  }

  .card {
    position: relative;
    aspect-ratio: 2.5 / 3.5;
    font-size: min(1vh, 0.25rem);
    height: 80em;
    background: var(--bg-1);
    border-radius: 2em;
    transform: rotateY(180deg);
    transition: transform 0.4s;
    transform-style: preserve-3d;
    padding: 0;
    user-select: none;
    cursor: pointer;
  }

  .card.flipped {
    transform: rotateY(0);
  }

  .front,
  .back {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    backface-visibility: hidden;
    border-radius: 2em;
    border: 1px solid var(--fg-2);
    box-sizing: border-box;
    padding: 2em;
  }

  .front {
    background:
      url(./svelte-logo.svg) no-repeat 5em 5em,
      url(./svelte-logo.svg) no-repeat calc(100% - 5em) calc(100% - 5em);
    background-size:
      8em 8em,
      8em 8em;
  }

  .back {
    transform: rotateY(180deg);
  }

  .symbol {
    font-size: 30em;
    color: var(--fg-1);
  }

  .pattern {
    width: 100%;
    height: 100%;
    background-color: var(--bg-2);
    /* pattern from https://projects.verou.me/css3patterns/#marrakesh */
    background-image: radial-gradient(var(--bg-3) 0.9em, transparent 1em),
      repeating-radial-gradient(
        var(--bg-3) 0,
        var(--bg-3) 0.4em,
        transparent 0.5em,
        transparent 2em,
        var(--bg-3) 2.1em,
        var(--bg-3) 2.5em,
        transparent 2.6em,
        transparent 5em
      );
    background-size:
      3em 3em,
      9em 9em;
    background-position: 0 0;
    border-radius: 1em;
  }
</style>
