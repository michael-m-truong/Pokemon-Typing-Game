<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Keyboard from './Keyboard.vue'


let pokemonName = ref('');
let pokemonImageUrl = ref('');
let pokemonCaught = ref(0);

async function fetchData() {
  try {
    const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = response.data.name;
    pokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
  } catch (error) {
    console.error(error);
  }
}

async function handleEvent() {
  pokemonCaught.value +=1
  try {
    const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = response.data.name;
    pokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  fetchData();
});

</script>



<template>
    <div class="container">
      <div class="regions">
        <!-- <button @click="fetchData">Fetch Pokemon Name and Image</button> -->
        <button>Kanto</button>
        <button>Johto</button>
        <button>Hoenn</button>
        <button>Sinnoh</button>
      </div>

      <div class="centered-content">
        <div class="image-container">
          <img :src="pokemonImageUrl" alt="Pokemon" v-if="pokemonImageUrl" style="height: 50vh; width: auto;"/>
          <h2>{{ pokemonName }}</h2>
        </div>
      </div>

      <div class="stats">
        <h2>Pokemon Caught: {{pokemonCaught}}</h2>
      </div>

    </div>
    <Keyboard :onCustomEvent="handleEvent" :pokemonName="pokemonName"/>
  </template>
  
  <style scoped>
  .container {
    display: flex;
  }
  
  .regions, .settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1em;
  }
  
  .centered-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1; /* Allow the centered content to grow and fill the remaining space */
  }
  
  .image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  button {
    min-width: 10em;
    align-self: flex-start;
  }
  </style>
  
  
  
  
  
  
