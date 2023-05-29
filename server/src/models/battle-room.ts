import { AllRegion } from "./all-region.js";
import { Region } from "./region.js";

export interface BattleRoomData {
    roomId: string;
    //players: number;
    gameStatus: boolean;
    allRegion: AllRegion;
    // totalPokemonCaught: string[];
    // totalPokemonIndexSet: Set<number>;
  }