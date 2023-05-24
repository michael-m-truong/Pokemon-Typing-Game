import { Region } from "./region";

export class AllRegion extends Region {
    
    constructor(startIndex: number, endIndex: number) {
        super(startIndex, endIndex)
    }

    getPokemonCaught(): string[] {
        return Region.totalPokemonCaught
    }

    // combinePokemonCaught(pokemonCaught: string[]) {
    //     for (const pokemon of pokemonCaught) {
    //         this.pokemonCaught.push(pokemon);
    //     }
    // }
      
}