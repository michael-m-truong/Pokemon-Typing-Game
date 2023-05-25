import { createServer } from "http";
import { Server } from "socket.io";
import { Region} from "./models/region.js"
import { GameRoomData } from "./models/game-room-data.js";

const http = createServer();
const io = new Server(http, {
    cors: { origin: "*" }
  });

const chatMessages: string[] = []; // Collection to store chat messages
let connectedClients: number = 0; // Number of connected clients
let gameRooms: Map<string, GameRoomData> = new Map(); // Array to store game room names

const TOTAL_POKEMON = {startIndex: 1, endIndex: 493}
const TOTAL_KANTO_POKEMON = {startIndex: 1, endIndex: 151}
const TOTAL_JOHTO_POKEMON = {startIndex: 152, endIndex: 251}
const TOTAL_HOENN_POKEMON = {startIndex: 252, endIndex: 386}
const TOTAL_SINNOH_POKEMON = {startIndex: 387, endIndex: 493}


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', () => {
    connectedClients++;

    if (connectedClients === 1) {
      // Create a new game room and join it
      let gameRoom = `GameRoom${gameRooms.size + 1}`;
      gameRooms.set(gameRoom, {
        roomId: gameRoom,
        gameStatus: true,
        kanto: new Region(TOTAL_KANTO_POKEMON.startIndex, TOTAL_KANTO_POKEMON.endIndex)
      })

      // Join the game room
      socket.join(gameRoom);
      console.log(`Client ${socket.id} joined ${gameRoom}`);
    } else if (connectedClients === 2) {
      // Join the existing game room
      let gameRoom = `GameRoom${gameRooms.size}`;
      socket.join(gameRoom);
      console.log(`Client ${socket.id} joined ${gameRoom}`);
      connectedClients = 0;

      const roomSockets = io.sockets.adapter.rooms.get(gameRoom);
      if (roomSockets) {
        roomSockets.forEach((clientId) => {
          const socket = io.sockets.sockets.get(clientId);
          const message = `Hello, client ${clientId}!`;

          socket.emit('ready', { 
            msg: message, 
            nextPokemon: gameRooms.get(gameRoom).kanto.getNextPokemon()
          });
        });
      }
    }
  
  });

  socket.on('caughtPokemon', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    console.log(joinedRooms)
    console.log(`Client ${socket.id} is in rooms:`, joinedRooms[0]);
    socket.emit('recievePokemon', {
      nextPokemonIndex: gameRooms.get(joinedRooms[0]).kanto.getNextPokemon()
    })

    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.caughtPokemonMiniImg
        });
      }
    });
  });
  
  

  // Check if there are two connected clients
  
  // socket.on('disconnect', () => {
  //   console.log('a user disconnected');
  //   connectedClients--;

  //   // Remove the game room if it becomes empty
  //   if (connectedClients === 0) {
  //     const gameRoom = gameRooms.pop();
  //     console.log(`Game room ${gameRoom} removed`);
  //   }
  // });
});
  
http.listen(8080, () => console.log('listening on http://localhost:8080'));
  
function getSocketsInRoom(roomName) {
  const room = io.sockets.adapter.rooms.get(roomName);
  if (room) {
    return Array.from(room);
  }
  return [];
} 
  
  // Regular Websockets
  
  // const WebSocket = require('ws')
  // const server = new WebSocket.Server({ port: '8080' })
  
  // server.on('connection', socket => { 
  
  //   socket.on('message', message => {
  
  //     socket.send(`Roger that! ${message}`);
  
  //   });
  
  // });