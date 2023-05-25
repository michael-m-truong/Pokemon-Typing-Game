<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Keyboard from './Keyboard.vue';
import { Region } from '../models/region'
import { Regions } from '../types/regions';
import { RegionName } from '../types/region-name';
import { AllRegion } from '../models/all-region';
import MusicPlayer from './MusicPlayer.vue'
import { io } from "socket.io-client";


let currentPokemonIndex: number | undefined;
let pokemonName = ref('');
let pokemonImageUrl = ref('');
let count = ref(0);
let pokemonCaught = ref<string[]>([]);
let currentMiniPokemon = ref('');

let nextPokemonIndex: number | undefined;
let nextPokemonName = ref('')
let nextPokemonImageUrl = ref('')
let nextMiniPokemon = ref('')

//kanto 1-151   151 total
//johto 152-251  101 total
//hoenn 252-386   135 total
//sinnoh 387-493   107 total

const TOTAL_POKEMON = {startIndex: 1, endIndex: 493}
const TOTAL_KANTO_POKEMON = {startIndex: 1, endIndex: 151}
const TOTAL_JOHTO_POKEMON = {startIndex: 152, endIndex: 251}
const TOTAL_HOENN_POKEMON = {startIndex: 252, endIndex: 386}
const TOTAL_SINNOH_POKEMON = {startIndex: 387, endIndex: 493}

let allRegions: AllRegion;
let kantoRegion: Region;
let johtoRegion: Region;
let hoennRegion: Region;
let sinnohRegion: Region;


let regions: Regions;
let currentRegion: Region;

let totalSockets: number = 0

async function fetchData() {
  try {
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const randomPokemonId = currentRegion.getNextPokemon()
    if (randomPokemonId == -1) return
    currentPokemonIndex = randomPokemonId
    console.log(randomPokemonId)
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/386`);
    pokemonName.value = response.data.species.name;
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
    Region.totalPokemonIndexSet.add(currentPokemonIndex)
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    //const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = nextPokemonName.value;
    pokemonImageUrl.value = nextPokemonImageUrl.value;
    //console.log(pokemonCaught.value)
    if (!(currentRegion instanceof AllRegion)) {
      pokemonCaught.value.push(currentMiniPokemon.value)
    }
    Region.totalPokemonCaught.push(currentMiniPokemon.value)
    Region.totalPokemonIndexSet.add(currentPokemonIndex)
    
    if (currentPokemonIndex !== undefined && (currentRegion instanceof AllRegion)) {
      if (currentPokemonIndex >= 1 && currentPokemonIndex <= 151) {
        kantoRegion.addPokemonCaught(currentMiniPokemon.value);
      } else if (currentPokemonIndex >= 152 && currentPokemonIndex <= 251) {
        johtoRegion.addPokemonCaught(currentMiniPokemon.value);
      } else if (currentPokemonIndex >= 252 && currentPokemonIndex <= 386) {
        hoennRegion.addPokemonCaught(currentMiniPokemon.value);
      } else if (currentPokemonIndex >= 387 && currentPokemonIndex <= 493) {
        sinnohRegion.addPokemonCaught(currentMiniPokemon.value);
      }
  }

    //console.log(pokemonCaught.value)
    //allRegions.addPokemonCaught(currentMiniPokemon.value)
    currentMiniPokemon.value = nextMiniPokemon.value
    currentPokemonIndex = nextPokemonIndex

    let savedIndexes: string = JSON.stringify(Array.from(Region.totalPokemonIndexSet))
    localStorage.setItem('totalPokemonIndexSet', savedIndexes)

    let savedImgs: string = JSON.stringify(Array.from(Region.totalPokemonCaught))
    localStorage.setItem('totalPokemonCaught', savedImgs)

    loadNext()
  } catch (error) {
    console.error(error);
  }
}

async function loadNext() {
  try {
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    const randomPokemonId = currentRegion.getNextPokemon()
    if (randomPokemonId == -1) return
    nextPokemonIndex = randomPokemonId
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    nextPokemonName.value = response.data.species.name;
    nextPokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
    nextMiniPokemon.value = response.data.sprites.front_default;
    console.log("next")
  } catch (error) {
    console.error(error);
  }
}


function changeRegion(region: RegionName) {
  console.log("this better not run")
  if (!regions.hasOwnProperty(region)) {
    return;
  }
  else if (currentRegion == regions[region]) {
    return;
  }
  const buttons = document.getElementsByClassName('region');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  const selectedButton = document.querySelector(`.region.${region}`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  currentRegion.updatePokemonCaught(pokemonCaught.value)
  currentRegion.addPokemonToOrder(nextPokemonIndex)
  currentRegion.addPokemonToOrder(currentPokemonIndex)
  // if (!(currentRegion instanceof AllRegion)) {
  //   allRegions.combinePokemonCaught(pokemonCaught.value);
  // }
  //change region 
  currentRegion = regions[region]
  pokemonCaught.value = currentRegion.getPokemonCaught()
  console.log(currentRegion)
  fetchData();
}

function multiplayer() {
  //alert("Not working yet amber and kira, in progress -Michael")
  if (totalSockets === 1) return
  const socket = io('http://localhost:8080');

  socket.emit('joinRoom')

  socket.on('ready', text => {
    alert(text)
    init_multiplayer()
    
  });
  totalSockets++
}

function restart() {
  allRegions = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
  kantoRegion = new Region(TOTAL_KANTO_POKEMON.startIndex, TOTAL_KANTO_POKEMON.endIndex);
  johtoRegion = new Region(TOTAL_JOHTO_POKEMON.startIndex, TOTAL_JOHTO_POKEMON.endIndex);
  hoennRegion = new Region(TOTAL_HOENN_POKEMON.startIndex, TOTAL_HOENN_POKEMON.endIndex);
  sinnohRegion = new Region(TOTAL_SINNOH_POKEMON.startIndex, TOTAL_SINNOH_POKEMON.endIndex);
  localStorage.removeItem('totalPokemonCaught');
  localStorage.removeItem('totalPokemonIndexSet');
  currentPokemonIndex = undefined;
  pokemonName.value = '';
  pokemonImageUrl.value = '';
  count.value = 0;
  pokemonCaught.value = [];
  currentMiniPokemon.value = '';
  nextPokemonIndex = undefined;
  nextPokemonName.value = '';
  nextPokemonImageUrl.value = '';
  nextMiniPokemon.value = '';

  fetchData()
}

function init_multiplayer() {
  allRegions = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
  kantoRegion = new Region(TOTAL_KANTO_POKEMON.startIndex, TOTAL_KANTO_POKEMON.endIndex);
  johtoRegion = new Region(TOTAL_JOHTO_POKEMON.startIndex, TOTAL_JOHTO_POKEMON.endIndex);
  hoennRegion = new Region(TOTAL_HOENN_POKEMON.startIndex, TOTAL_HOENN_POKEMON.endIndex);
  sinnohRegion = new Region(TOTAL_SINNOH_POKEMON.startIndex, TOTAL_SINNOH_POKEMON.endIndex);
  currentPokemonIndex = undefined;
  pokemonName.value = '';
  pokemonImageUrl.value = '';
  count.value = 0;
  pokemonCaught.value = [];
  currentMiniPokemon.value = '';
  nextPokemonIndex = undefined;
  nextPokemonName.value = '';
  nextPokemonImageUrl.value = '';
  nextMiniPokemon.value = '';
}

onMounted(() => {

  let savedPokemon: any = JSON.parse(localStorage.getItem('totalPokemonCaught') || 'null');
  if (savedPokemon !== null) Region.totalPokemonCaught = savedPokemon

  let savedIndexes: any = JSON.parse(localStorage.getItem('totalPokemonIndexSet') ?? 'null');
  if (savedIndexes !== null) Region.totalPokemonIndexSet = new Set(savedIndexes)

  allRegions = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
  kantoRegion = new Region(TOTAL_KANTO_POKEMON.startIndex, TOTAL_KANTO_POKEMON.endIndex);
  johtoRegion = new Region(TOTAL_JOHTO_POKEMON.startIndex, TOTAL_JOHTO_POKEMON.endIndex);
  hoennRegion = new Region(TOTAL_HOENN_POKEMON.startIndex, TOTAL_HOENN_POKEMON.endIndex);
  sinnohRegion = new Region(TOTAL_SINNOH_POKEMON.startIndex, TOTAL_SINNOH_POKEMON.endIndex);

  if (savedPokemon !== null) {
    for (const img of savedPokemon) {
      const filename = img.substring(img.lastIndexOf('/') + 1);
      let num = parseInt(filename.replace('.svg', ''));
      console.log(filename)
      if (num >= 1 && num <= 151) {
        kantoRegion.addPokemonCaught(img);
      } else if (num >= 152 && num <= 251) {
        johtoRegion.addPokemonCaught(img);
      } else if (num >= 252 && num <= 386) {
        hoennRegion.addPokemonCaught(img);
      } else if (num >= 387 && num <= 493) {
        sinnohRegion.addPokemonCaught(img);
      }
    }
    pokemonCaught.value = kantoRegion.getPokemonCaught()
  }
  
  currentRegion = kantoRegion
  regions = {
    all: allRegions,
    kanto: kantoRegion,
    johto: johtoRegion,
    hoenn: hoennRegion,
    sinnoh: sinnohRegion,
  };

  fetchData();
});

</script>



<template>
    <div class="container">
      <div class="regions">
        <!-- <button @click="fetchData">Fetch Pokemon Name and Image</button> -->
        <button @click="()=>multiplayer()" class="">Multiplayer</button>
        <button @click="()=>changeRegion('all')" class="region all">All Regions</button>
        <button @click="()=>changeRegion('kanto')" class="region kanto active">Kanto</button>
        <button @click="()=>changeRegion('johto')" class="region johto">Johto</button>
        <button @click="()=>changeRegion('hoenn')" class="region hoenn">Hoenn</button>
        <button @click="()=>changeRegion('sinnoh')" class="region sinnoh">Sinnoh</button>
        <button @click="()=>restart()" class="">Restart Game</button>
        <MusicPlayer :pokemonName="pokemonName"/>
      </div>

      <div class="centered-content">
        <div class="image-container">
          <img :src="pokemonImageUrl" alt="Pokemon" v-if="pokemonImageUrl" style="height: 50vh; width: auto; max-width: 380px; max-height: 373px;"/>
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

  /* * {
    border: 1px solid red;
  } */

  .region.active {
    background-color: rgb(198, 111, 111)
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
  
  
  
  
  
  
