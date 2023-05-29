import { AllRegion } from "./all-region.js";
import { Region } from "./region.js";

export interface BattleRoomData {
    roomId: string;
    //players: number;
    gameStatus: boolean;
    allRegion: AllRegion;
    player1: string
    player2: string
    pending: boolean
    // totalPokemonCaught: string[];
    // totalPokemonIndexSet: Set<number>;
  }