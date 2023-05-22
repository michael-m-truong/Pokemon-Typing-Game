export class Region {
    
    pokemonOrder: number[];
    pokemonCaught: number;

    constructor(public pokemonTotal: number) {
        this.pokemonCaught = 0
        this.pokemonOrder = Array.from({ length: pokemonTotal }, (_, index) => index + 1);
        this.pokemonOrder = this.shuffleArray(this.pokemonOrder)
    }

    getPokemonOrder(): number[] {
        return this.pokemonOrder
    }

    getNextPokemon(): number {
        if (this.pokemonCaught == this.pokemonOrder.length) {
            return -1
        }
        return this.pokemonOrder[this.pokemonCaught++];
    }
    
    shuffleArray(array: number[]): number[] {
        const length = array.length;
        for (let i = length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}