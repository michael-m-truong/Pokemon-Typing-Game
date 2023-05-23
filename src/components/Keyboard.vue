<template>
  <div class="tiles">
    <div v-for="(tile, index) in tiles" :key="index" :class="getTileClass(index)">
      {{ getTileContent(tile, index) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  pokemonName: string;
  onCustomEvent: () => void;
}>();

const tiles = ref('');

// Watch for changes in the `pokemonName` prop
watch(() => props.pokemonName, (newPokemonName) => {
  tiles.value = newPokemonName;
});

const typedLetters = ref('');

function getTileClass(index: number): any {
  const isCorrect = typedLetters.value[index] === tiles.value[index];
  const isIncorrect = typedLetters.value[index] && !isCorrect;
  return {
    tile: true,
    correct: isCorrect,
    incorrect: isIncorrect,
  };
}

function getTileContent(tile: string, index: number): string {
  if (typedLetters.value[index]) {
    return typedLetters.value[index];
  }
  return tile;
}

window.addEventListener('keydown', (event) => {
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    typedLetters.value += event.key;
  } else if (event.key === 'Backspace') {
    typedLetters.value = typedLetters.value.slice(0, -1);
  }
});



watch(typedLetters, (newTypedLetters) => {
  //console.log(newTypedLetters);
  if (newTypedLetters === tiles.value) {
    // Word is correctly typed, run the function
    setTimeout(() => {
      emitEvent();
    }, 200); // Adjust the delay as needed
  }
});

function emitEvent(): void {
  props.onCustomEvent();
  typedLetters.value = ''; // Reinitialize typedLetters to an empty string
}

</script>

<style scoped>
.tiles {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tile {
  width: 50px;
  height: 50px;
  background-color: #f2f2f2;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
}

.correct {
  background-color: #6AAA64;
}

.incorrect {
  background-color: red;
}
</style>
