import { Region } from "./region.js";

export interface GameRoomData {
    roomId: string;
    //players: number;
    gameStatus: boolean;
    kanto: Region;
  }