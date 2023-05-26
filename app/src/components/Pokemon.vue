<script setup lang="ts">
import axios from 'axios';
import { Ref, onMounted, ref } from 'vue';
import Keyboard from './Keyboard.vue';
import { Region } from '../models/region'
import { Regions } from '../types/regions';
import { RegionName } from '../types/region-name';
import { AllRegion } from '../models/all-region';
import MusicPlayer from './MusicPlayer.vue'
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from '@socket.io/component-emitter';


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

let allRegion: AllRegion;
let kantoRegion: Region;
let johtoRegion: Region;
let hoennRegion: Region;
let sinnohRegion: Region;


let regions: Regions;
let currentRegion: Region;

let totalSockets: Ref<number> = ref(0)
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

let showModal = ref(false);

async function fetchData(index?: number) {
  try {
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    let randomPokemonId;
    if (index) {
      console.log('huhhhhh')
      randomPokemonId = index
    }
    else {
      console.log(index)
      randomPokemonId = currentRegion.getNextPokemon()
    }
    if (randomPokemonId == -1) return
    currentPokemonIndex = randomPokemonId
    console.log(randomPokemonId)
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    pokemonName.value = response.data.species.name;
    pokemonImageUrl.value = response.data.sprites.other.dream_world.front_default;
    currentMiniPokemon.value = response.data.sprites.front_default;
    if (!index) {
      console.log(index)
      loadNext()
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleEvent() {
  console.log(pokemonCaught)
  count.value +=1
  try {
    //const randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random number between 1 and 151
    //const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
    if (totalSockets.value == 0) {
      Region.totalPokemonIndexSet.add(currentPokemonIndex)
      console.log("hereeee")
      pokemonName.value = nextPokemonName.value;
      console.log(nextPokemonImageUrl.value)
      pokemonImageUrl.value = nextPokemonImageUrl.value;
    }
    else {
      socket.emit('addTotalPokemonIndexSet', {
        totalPokemonIndexSet: currentPokemonIndex
      })
    }
    //console.log(pokemonCaught.value)
    if (!(currentRegion instanceof AllRegion)) {
      pokemonCaught.value.push(currentMiniPokemon.value)
    }
    if (totalSockets.value == 0) {
      Region.totalPokemonCaught.push(currentMiniPokemon.value)
      Region.totalPokemonIndexSet.add(currentPokemonIndex)
    }
    else {
      socket.emit('addAllRegion', {
        totalPokemonCaught: currentMiniPokemon.value,
        totalPokemonIndexSet: currentPokemonIndex
      })
    }
    if (currentPokemonIndex !== undefined && (currentRegion instanceof AllRegion) && totalSockets.value != 0) {
      console.log('pleasegodplease')
      pokemonCaught.value.push(currentMiniPokemon.value)
      if (currentPokemonIndex >= 1 && currentPokemonIndex <= 151) {
        socket.emit('addKanto', {
          pokemonMiniImg: currentMiniPokemon.value
        })
      } else if (currentPokemonIndex >= 152 && currentPokemonIndex <= 251) {
        socket.emit('addJohto', {
          pokemonMiniImg: currentMiniPokemon.value
        })
      } else if (currentPokemonIndex >= 252 && currentPokemonIndex <= 386) {
        socket.emit('addHoenn', {
          pokemonMiniImg: currentMiniPokemon.value
        })
      } else if (currentPokemonIndex >= 387 && currentPokemonIndex <= 493) {
        socket.emit('addSinnoh', {
          pokemonMiniImg: currentMiniPokemon.value
        })
      }
    }
    else if (currentPokemonIndex !== undefined && (currentRegion instanceof AllRegion)) {
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
    if (totalSockets.value == 0) {
      currentMiniPokemon.value = nextMiniPokemon.value
      currentPokemonIndex = nextPokemonIndex

      let savedIndexes: string = JSON.stringify(Array.from(Region.totalPokemonIndexSet))
      localStorage.setItem('totalPokemonIndexSet', savedIndexes)

      let savedImgs: string = JSON.stringify(Array.from(Region.totalPokemonCaught))
      localStorage.setItem('totalPokemonCaught', savedImgs)

      loadNext()
    }
    else {// if (totalSockets.value != 0 && !(currentRegion instanceof AllRegion)) {
      socket.emit('caughtPokemon', {
        caughtPokemonIndex: currentPokemonIndex,
        caughtPokemonMiniImg: currentMiniPokemon.value,
        currentRegion: currentRegion.determineRegion()
      })
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadNext() {
  console.log('huh')
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
    console.log(nextPokemonImageUrl.value)
  } catch (error) {
    console.error(error);
  }
}


function changeRegion(region: RegionName) {
  console.log("this better not run")
  if (!regions.hasOwnProperty(region)) {
    console.log("here")
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

  if (totalSockets.value != 0) {
    socket.emit('changeRegion', {
          oldRegion: currentRegion.determineRegion(),
          newRegion: region,
          currentPokemonIndex: currentPokemonIndex
    })
  }
  else {
    currentRegion.updatePokemonCaught(pokemonCaught.value)
    currentRegion.addPokemonToOrder(nextPokemonIndex)
    currentRegion.addPokemonToOrder(currentPokemonIndex)
  }
  // if (!(currentRegion instanceof AllRegion)) {
  //   allRegions.combinePokemonCaught(pokemonCaught.value);
  // }
  //change region 
  currentRegion = regions[region]

  if (totalSockets.value != 0) {
    socket.emit('syncNewRegion', {
      newRegion: currentRegion.determineRegion()
    })
  }
  else {
    pokemonCaught.value = currentRegion.getPokemonCaught()
    console.log(currentRegion)
    fetchData();
  }
}

function multiplayer() {
  //alert("Not working yet amber and kira, in progress -Michael")
  if (totalSockets.value === 1) return
  socket = io('https://pokemon-typing-game-server.onrender.com/');

  socket.emit('joinRoom')

  socket.on('ready', data => {
    alert(data.msg)
    init_multiplayer()
    currentPokemonIndex = data?.nextPokemonIndex
    fetchData(currentPokemonIndex)
  });

  socket.on('recievePokemon', data => {
    currentPokemonIndex = data?.nextPokemonIndex
    fetchData(currentPokemonIndex)
  });

  socket.on('syncPokemon', data => {
    console.log(data.currentRegion)
    if (((((currentRegion.determineRegion() != data.currentRegion) && (currentRegion.determineRegion() != 'allRegion' || data.currentRegion == 'allRegion')) || (currentRegion.determineRegion() == 'allRegion' && data.currentRegion == 'allRegion')))) return
    console.log("PLEASEEE")
    pokemonCaught.value.push(data?.otherPokemon)
    console.log(pokemonCaught.value)
  });

  socket.on('syncNewRegionPokemon', data => {
    pokemonCaught.value = data?.newPokemonCaught
  });

  totalSockets.value++
}

function restart() {
  allRegion = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
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
  Region.totalPokemonCaught = []
  Region.totalPokemonIndexSet.clear()
  init_game()
  fetchData()
}

function init_multiplayer() {
  allRegion = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
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

function init_game() {
  let savedPokemon: any = JSON.parse(localStorage.getItem('totalPokemonCaught') || 'null');
  if (savedPokemon !== null) Region.totalPokemonCaught = savedPokemon

  let savedIndexes: any = JSON.parse(localStorage.getItem('totalPokemonIndexSet') ?? 'null');
  if (savedIndexes !== null) Region.totalPokemonIndexSet = new Set(savedIndexes)

  allRegion = new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex);
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
    const buttons = document.getElementsByClassName('region');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }
    const selectedButton = document.querySelector(`.region.kanto`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }
  }
  
  currentRegion = kantoRegion
  regions = {
    allRegion: allRegion,
    kanto: kantoRegion,
    johto: johtoRegion,
    hoenn: hoennRegion,
    sinnoh: sinnohRegion,
  };

  fetchData();
}

onMounted(() => {
  init_game()
});

</script>



<template>
    <div class="container">
      <div class="regions">
        <!-- <button @click="fetchData">Fetch Pokemon Name and Image</button> -->
        <button v-if="totalSockets == 0" @click="()=> showModal = true">Multiplayer</button>
        <!-- <button v-if="totalSockets == 0" @click="()=>multiplayer()" class="">Multiplayer</button> -->
        <button v-if="totalSockets == 1" @click="()=>{totalSockets = 0; socket.disconnect(); init_game()}" class="">Quit</button>

        <!-- Modal -->
        <div class="modal-overlay" v-if="showModal">
          <div class="modal">
            <div class="modal-content">
              <!-- Modal content goes here -->
              <h2>Select game mode</h2>
              <br>
              <button @click="()=>{multiplayer(); showModal = false}" class="">Co-op</button>
              <button @click="()=>{showModal = false}" class="">Battle</button>
              <br>
              <br>
              <br>
              <!-- Close button -->
              <button @click="()=>showModal = false">Close</button>
            </div>
          </div>
        </div>

        <button @click="()=>changeRegion('allRegion')" class="region allRegion">All Regions</button>
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
}
  </style>
  
  
  
  
  
  
