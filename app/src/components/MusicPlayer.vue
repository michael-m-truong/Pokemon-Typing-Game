<script setup lang="ts">

import { onMounted, ref, watch } from 'vue';
import three_birds from '../assets/audio/three_birds.mp3'

const props = defineProps<{ pokemonName: string }>()

let audioPlayer: any;

watch(() => props.pokemonName, (newPokemonName) => {
    if (newPokemonName === 'X') {
        //playMusic('../assets/audio/tomp3.cc - Pokemon UltraSun  UltraMoon  Battle Articuno Zapdos Moltres Music HQ.mp3');
    } else if (newPokemonName === 'Y') {
        //playMusic('path/to/music-y.mp3');
    } else if (newPokemonName === 'Z') {
        //playMusic('path/to/music-z.mp3');
    } else {
        // Stop the music if it doesn't match any specific name
        //stopMusic();
        //audioSource.value = '../assets/audio/three_birds.mp3'
        //changeMusic(three_birds)
        //playMusic();
    }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  audioPlayer = document.getElementById('legendaryAudioPlayer')
  console.log(audioPlayer)
});

function handleKeyDown(event: KeyboardEvent) {
    changeMusic(three_birds)
    playMusic()
    document.removeEventListener('keydown', handleKeyDown);
}

function playMusic(): void {
    if (audioPlayer) {
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

/* #audioPlayer {
    max-width: 11.8em;
} */

</style>
