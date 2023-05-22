<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Keyboard from './Keyboard.vue'


let pokemonName = ref('');
let pokemonImageUrl = ref('');
let count = ref(0);
let pokemonCaught = ref<string[]>([]);
let currentMiniPokemon = ref('');

let nextPokemonName = ref('')
let nextPokemonImageUrl = ref('')
let nextMiniPokemon = ref('')


async function fetchData() {
  try {
    const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = response.data.name;
    pokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
    currentMiniPokemon.value = response.data.sprites.front_default;
    loadNext()
  } catch (error) {
    console.error(error);
  }
}

async function handleEvent() {
  count.value +=1
  try {
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    //const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = nextPokemonName.value;
    pokemonImageUrl.value = nextPokemonImageUrl.value;
    pokemonCaught.value.push(currentMiniPokemon.value)
    currentMiniPokemon.value = nextMiniPokemon.value
    loadNext()
  } catch (error) {
    console.error(error);
  }
}

async function loadNext() {
  try {
    const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    nextPokemonName.value = response.data.name;
    nextPokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
    nextMiniPokemon.value = response.data.sprites.front_default;
    console.log("next")
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
          <img :src="pokemonImageUrl" alt="Pokemon" v-if="pokemonImageUrl" style="height: 50vh; width: auto; max-width: 380px;"/>
          <h2>{{ pokemonName }}</h2>
          <Keyboard :onCustomEvent="handleEvent" :pokemonName="pokemonName"/>
        </div>
      </div>

      <div class="stats">
        <h2>Pokemon Caught: {{ pokemonCaught.length }}</h2>
        <div class="image-list">
          <img v-for="pokemon in pokemonCaught" :key="pokemon" :src="pokemon" alt="Caught Pokemon" class="caught-pokemon" style="height: 50px; width:autogd"/>
        </div>
      </div>

    </div>
  </template>
  
  <style scoped>

  * {
    border: 1px solid red;
  }

  h2 {
    margin: 0;
    padding: 0;
    width: 400px
  }

  .container {
    display: flex;
    height: auto;
    /* margin: auto */
  }
  
  .regions, .settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1em;
    height:auto;
  }

  .regions {
    padding-top: 20px;
    margin-left: 70px;

  }
  
  .centered-content {
    display: flex;
    justify-content: center;
    align-items: center;
    /* flex-grow: 1;  */
    width: 100%; /* Occupy the full width of the container */
    height: 475.6px;
    margin-left: 120px;
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

  .stats {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  /* gap: 8px; */
  max-width: 305px;
  max-height: 300px;
  overflow-y: auto;

}
  </style>
  
  
  
  
  
  
