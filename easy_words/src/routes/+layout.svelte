<script>
  import Fa from "svelte-fa";
  import {
    faGraduationCap,
    faPlus,
    faCircleUser,
    faGear,
    faListCheck,
  } from "@fortawesome/free-solid-svg-icons";
</script>

<nav class="navbar">
  <ul class="nav-list">
    <li class="nav-item">
      <a href="/"><Fa icon={faListCheck} /></a>
    </li>
    <li class="nav-item">
      <a href="/cards"><Fa icon={faGraduationCap} /></a>
    </li>
    <li class="nav-item add">
      <a href="/add"><Fa icon={faPlus} /></a>
    </li>
    <li class="nav-item">
      <a href="/setting"><Fa icon={faGear} /></a>
    </li>
    <li class="nav-item">
      <a href="/profile" aria-label="Profile">
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
    padding: 20px 0;
    position: absolute;
    bottom: 35px;
    left: 0;
  }

  .nav-list {
    list-style: none;
    display: flex;
    justify-content: space-around;
    margin: 0;
    padding: 0;
  }

  .nav-item a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.2em;
  }

  .nav-item a:hover {
    text-decoration: underline;
  }
</style>
