<script>
  import { page } from "$app/stores";
  import { derived } from "svelte/store";

  import Fa from "svelte-fa";
  import {
    faGraduationCap,
    faPlus,
    faCircleUser,
    faGear,
    faListCheck,
  } from "@fortawesome/free-solid-svg-icons";
  const path = derived(page, ($page) => $page.url.pathname);
</script>

<nav class="navbar">
  <ul class="nav-list">
    <li class="nav-item">
      <a href="/" class:active={$path === "/"}><Fa icon={faListCheck} /></a>
    </li>
    <li class="nav-item">
      <a href="/cards" class:active={$path === "/cards"}
        ><Fa icon={faGraduationCap} /></a
      >
    </li>
    <li class="nav-item add">
      <a href="/add" class:active={$path === "/add"}><Fa icon={faPlus} /></a>
    </li>
    <li class="nav-item">
      <a href="/setting" class:active={$path === "/setting"}
        ><Fa icon={faGear} /></a
      >
    </li>
    <li class="nav-item">
      <a
        href="/profile"
        aria-label="Profile"
        class:active={$path === "/profile"}
      >
        <Fa icon={faCircleUser} />
      </a>
    </li>
  </ul>
</nav>

<slot />

<style>
  .navbar {
    margin: auto;
    width: 100%;
    background-color: #333;
    padding: 10px 0;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .nav-list {
    list-style: none;
    display: flex;
    justify-content: space-around;
    margin: 0;
    padding: 0 20px;
  }

  .nav-item a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.5em;
    transition: all 0.3s ease;
  }

  .nav-item a:hover {
    text-decoration: underline;
    color: #e62d2d;
  }
  .add {
    position: relative;
    top: -30px;
    width: 60px;
    height: 60px;
    background-color: #4caf50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0.2);
    transition: background-color 0.3s ease;
  }
  a.active {
    color: #e62d2d;
  }
</style>
