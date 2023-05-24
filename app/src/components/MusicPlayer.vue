<script setup lang="ts">

import { onMounted, watch } from 'vue';
import three_birds_song from '../assets/audio/three_birds.mp3'
import arceus_song from '../assets/audio/arceus.mp3'
import celibi_song from '../assets/audio/celibi.mp3'
import cresselia_song from '../assets/audio/crecelia.mp3'
import darkrai_song from '../assets/audio/darkrai.mp3';
import deoxys_song from '../assets/audio/deoxys.mp3';
import entei_song from '../assets/audio/entei.mp3';
import giratina_song from '../assets/audio/giratina.mp3';
import groudon_song from '../assets/audio/groudon.mp3';
import ho_oh_song from '../assets/audio/ho-oh.mp3';
import jirachi_song from '../assets/audio/jirachi.mp3';
import lugia_song from '../assets/audio/lugia.mp3';
import manaphy_song from '../assets/audio/manaphy.mp3';
import mew_song from '../assets/audio/mew.mp3';
import mewtwo_song from '../assets/audio/mewtwo.mp3';
import palkia_song from '../assets/audio/palkia.mp3';
import regi_song from '../assets/audio/regi.mp3';
import rivergods_song from '../assets/audio/rivergods.mp3';
import shaymin_song from '../assets/audio/shaymin.mp3';
import latios_song from '../assets/audio/latios.mp3'

const props = defineProps<{ pokemonName: string }>()

let audioPlayer: any;

let three_birds = new Set(['moltres','zapdos','articuno'])
let entei = new Set(['entei', 'suicune', 'raikou'])
let groudon = new Set(['groudon', 'kyogre', 'rayquaza'])
let arceus = new Set(['arceus'])
let celebi = new Set(['celebi'])
let darkrai = new Set(['darkrai'])
let giratina = new Set(['giratina'])
let shaymin = new Set(['shaymin'])
let rivergods = new Set(['uxie', 'mespirit', 'azelf'])
let palkia = new Set(['palkia', 'dialga'])
let regi = new Set(['regirock', 'regice', 'registeel', 'regigigas'])
let cresselia = new Set(['cresselia'])
let jirachi = new Set(['jirachi'])
let deoxys = new Set(['deoxys'])
let mew = new Set(['mew'])
let mewtwo = new Set(['mewtwo'])
let manaphy = new Set(['manaphy', 'phione'])
let ho_oh = new Set(['ho-oh'])
let lugia = new Set(['lugia'])
let latios = new Set(['latios', 'latias'])



watch(() => props.pokemonName, (newPokemonName) => {
    if (three_birds.has(newPokemonName)) {
        changeMusic(three_birds_song);
    } else if (entei.has(newPokemonName)) {
        changeMusic(entei_song);
    } else if (latios.has(newPokemonName)) {
        changeMusic(latios_song)
    } else if (giratina.has(newPokemonName)) {
        changeMusic(giratina_song)
    } else if (groudon.has(newPokemonName)) {
        changeMusic(groudon_song);
    } else if (arceus.has(newPokemonName)) {
        changeMusic(arceus_song);
    } else if (celebi.has(newPokemonName)) {
        changeMusic(celibi_song);
    } else if (darkrai.has(newPokemonName)) {
        changeMusic(darkrai_song);
    } else if (shaymin.has(newPokemonName)) {
        changeMusic(shaymin_song);
    } else if (rivergods.has(newPokemonName)) {
        changeMusic(rivergods_song);
    } else if (palkia.has(newPokemonName)) {
        changeMusic(palkia_song);
    } else if (regi.has(newPokemonName)) {
        changeMusic(regi_song);
    } else if (cresselia.has(newPokemonName)) {
        changeMusic(cresselia_song);
    } else if (jirachi.has(newPokemonName)) {
        changeMusic(jirachi_song);
    } else if (deoxys.has(newPokemonName)) {
        changeMusic(deoxys_song);
    } else if (mew.has(newPokemonName)) {
        changeMusic(mew_song);
    } else if (mewtwo.has(newPokemonName)) {
        changeMusic(mewtwo_song);
    } else if (manaphy.has(newPokemonName)) {
        changeMusic(manaphy_song);
    } else if (ho_oh.has(newPokemonName)) {
        changeMusic(ho_oh_song);
    } else if (lugia.has(newPokemonName)) {
        changeMusic(lugia_song);
    } else {
        // Stop the music or do any other desired action
        changeMusic('')
    }
    playMusic()
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  audioPlayer = document.getElementById('legendaryAudioPlayer')
  console.log(audioPlayer)
});

function handleKeyDown() {
    //changeMusic(three_birds)
    playMusic()
    document.removeEventListener('keydown', handleKeyDown);
}

function playMusic(): void {
    console.log('here')
    if (audioPlayer) {
        if (audioPlayer.src === "") return
        audioPlayer.pause();
        audioPlayer.play();
        audioPlayer.addEventListener('ended', () => {
        audioPlayer.currentTime = 0; // Restart from the beginning
        audioPlayer.play();
        })
    }
}

function changeMusic(musicUrl: any) {
    console.log(audioPlayer)
    audioPlayer.src = musicUrl;
}

// function stopMusic(): void {
//   if (audioPlayer) {
//     audioPlayer.pause();
//   }
// }


</script>

<template>
<audio ref="defaultAudioPlayer" id="defaultAudioPlayer">
  <source src="" type="audio/mp3">
  Your browser does not support the audio element.
</audio>
<audio ref="legendaryAudioPlayer" id="legendaryAudioPlayer">
  <source src="" type="audio/mp3">
  Your browser does not support the audio element.
</audio>
</template>

<style scoped>


</style>
