import { Region } from "./region.js";

export class AllRegion extends Region {
    
    constructor(startIndex: number, endIndex: number) {
        super(startIndex, endIndex)
    }

    getNextPokemon(): number {
        return this.pokemonOrder[this.pokemonOrder.length-1]
    }

    removeLastPokemon(): void {
        this.pokemonOrder.pop()
    }

    // combinePokemonCaught(pokemonCaught: string[]) {
    //     for (const pokemon of pokemonCaught) {
    //         this.pokemonCaught.push(pokemon);
    //     }
    // }
      
}