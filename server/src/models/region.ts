export class Region {
    
    // static totalPokemonCaught: string[] = [];
    // static totalPokemonIndexSet: Set<number|undefined> = new Set()
    pokemonOrder: number[];
    pokemonCaught: string[];
    startIndex: number;
    endIndex: number;

    constructor(startIndex: number, endIndex: number) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.pokemonCaught = []
        this.pokemonOrder = Array.from({ length: endIndex-startIndex+1 }, (_, index) => index + startIndex);
        let temp: any = new Set<number>();
        // for (let i = startIndex; i <= endIndex; i++) {
        //     if (!Region.totalPokemonIndexSet.has(i)) {
        //       temp.add(i);
        //     }
        //   }
        // this.pokemonOrder = Array.from(temp);
        this.pokemonOrder = Region.shuffleArray(this.pokemonOrder)
    }

    // loadPokemonCaught(savedPokemon: string) {
    //     this.pokemonCaught.push(savedPokemon);
    // }

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

    getNextPokemon(totalPokemonIndexSet: Set<number>): number | undefined{
        if (this.pokemonOrder.length == 0) {
            return -1
        }
        //console.log("num: "+ this.pokemonOrder[this.pokemonOrder.length-1])
        let randomPokemonIndex: number | undefined = this.pokemonOrder.pop();
        while (totalPokemonIndexSet.has(randomPokemonIndex)) {
            randomPokemonIndex = this.pokemonOrder.pop();
        }
        return randomPokemonIndex;

    }

    determineRegion(): string {
        if (this.startIndex == 1 && this.endIndex == 151) {
            return 'kanto'
        } else if (this.startIndex == 152 && this.endIndex == 251) {
            return 'johto'
        } else if (this.startIndex == 252 && this.endIndex == 386) {
            return 'hoenn'
        } else if (this.startIndex == 387 && this.endIndex == 493) {
            return 'sinnoh'
        }
        else {
            return 'allRegion'
        }
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