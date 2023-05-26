import { Region } from "./region.js";

export interface GameRoomData {
    roomId: string;
    //players: number;
    gameStatus: boolean;
    kanto: Region;
    johto: Region;
    hoenn: Region;
    sinnoh: Region;
    allRegion: Region;
    totalPokemonCaught: string[];
    totalPokemonIndexSet: Set<number>;
  }