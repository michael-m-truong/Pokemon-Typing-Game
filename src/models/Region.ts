export class Region {
    
    static totalPokemonCaught: string[] = [];
    static totalPokemonIndexSet: Set<number|undefined> = new Set()
    pokemonOrder: number[];
    pokemonCaught: string[];

    constructor(startIndex: number, endIndex: number) {
        this.pokemonCaught = []
        this.pokemonOrder = Array.from({ length: endIndex-startIndex+1 }, (_, index) => index + startIndex);
        this.pokemonOrder = Region.shuffleArray(this.pokemonOrder)
    }

    addPokemonCaught(pokemonMiniImage: string): void {
        this.pokemonCaught.push(pokemonMiniImage)
        //Region.totalPokemonCaught.push(pokemonMiniImage)
    }

    addPokemonToOrder(pokemonIndex: number | undefined): void{
        if (pokemonIndex == undefined) {
            return
        }
        this.pokemonOrder.push(pokemonIndex)
    }

    getPokemonCaught(): string[] {
        return this.pokemonCaught;
    }

    updatePokemonCaught(pokemonCaught: string[]): void {
        this.pokemonCaught = pokemonCaught
    }

    getNextPokemon(): number | undefined{
        if (this.pokemonOrder.length == 0) {
            return -1
        }
        console.log("num: "+ this.pokemonOrder[this.pokemonOrder.length-1])
        let randomPokemonIndex: number | undefined = this.pokemonOrder.pop();
        while (Region.totalPokemonIndexSet.has(randomPokemonIndex)) {
            randomPokemonIndex = this.pokemonOrder.pop();
        }
        return randomPokemonIndex;

    }
    
    static shuffleArray(array: number[]): number[] {
        const length = array.length;
        for (let i = length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}