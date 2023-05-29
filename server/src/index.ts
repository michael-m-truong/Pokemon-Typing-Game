import { createServer } from "http";
import express, { Request, Response } from 'express';
import { Server } from "socket.io";
import { Region} from "./models/region.js"
import { GameRoomData } from "./models/game-room-data.js";
import { BattleRoomData } from "./models/battle-room.js";
import { AllRegion } from "./models/all-region.js";
import { v4 as uuidv4 } from 'uuid';

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: '*', // Allow requests from any origin
    methods: ["GET", "POST"], // Allow GET and POST requests
  },
  });

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

const chatMessages: string[] = []; // Collection to store chat messages
let connectedClients: number = 0; // Number of connected clients
let connectedBattleClients: number = 0; // Number of connected clients
let gameRooms: Map<string, GameRoomData> = new Map(); // Array to store game room names
let battleRooms: Map<string, BattleRoomData> = new Map(); // Array to store game room names

let emptyGameRoom: string;
let emptyBattleRoom: string;


const TOTAL_POKEMON = {startIndex: 1, endIndex: 493}
const TOTAL_KANTO_POKEMON = {startIndex: 1, endIndex: 151}
const TOTAL_JOHTO_POKEMON = {startIndex: 152, endIndex: 251}
const TOTAL_HOENN_POKEMON = {startIndex: 252, endIndex: 386}
const TOTAL_SINNOH_POKEMON = {startIndex: 387, endIndex: 493}


io.on('connection', (socket) => {
  console.log(io.sockets.adapter.rooms)
  console.log('a user connected');

  socket.on('joinRoom', () => {
    connectedClients++;

    if (connectedClients === 1) {
      // Create a new game room and join it
      let uuid = uuidv4()
      let gameRoom = `GameRoom${uuid}`;
      emptyGameRoom = gameRoom
      gameRooms.set(gameRoom, {
        roomId: gameRoom,
        gameStatus: true,
        kanto: new Region(TOTAL_KANTO_POKEMON.startIndex, TOTAL_KANTO_POKEMON.endIndex),
        johto: new Region(TOTAL_JOHTO_POKEMON.startIndex, TOTAL_JOHTO_POKEMON.endIndex),
        hoenn: new Region(TOTAL_HOENN_POKEMON.startIndex, TOTAL_HOENN_POKEMON.endIndex),
        sinnoh: new Region(TOTAL_SINNOH_POKEMON.startIndex, TOTAL_SINNOH_POKEMON.endIndex),
        allRegion: new Region(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex),
        totalPokemonIndexSet: new Set<number>(),
        totalPokemonCaught: []
      })

      // Join the game room
      socket.join(gameRoom);
      console.log(`Client ${socket.id} joined ${gameRoom}`);
    } else if (connectedClients === 2) {
      // Join the existing game room
      let gameRoom = emptyGameRoom
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
            nextPokemon: gameRooms.get(gameRoom).kanto.getNextPokemon(new Set())
          });
        });
      }
    }
  
  });

  socket.on('joinBattleRoom', (data) => {
    connectedBattleClients++;
    console.log(data)
    if (connectedBattleClients === 1) {
      // Create a new game room and join it
      console.log("hereeeee")
      let uuid = uuidv4()
      let gameRoom = `BattleRoom${uuid}`;
      emptyBattleRoom = gameRoom
      battleRooms.set(gameRoom, {
        roomId: gameRoom,
        gameStatus: true,
        allRegion: new AllRegion(TOTAL_POKEMON.startIndex, TOTAL_POKEMON.endIndex),
        player1: data.username,
        player2: null,
        pending: false
      })

      // Join the game room
      socket.join(gameRoom);
      console.log(`Client ${socket.id} joined ${gameRoom}`);

      socket.emit('player1', {});

    } else if (connectedBattleClients === 2) {
      // Join the existing game room
      let gameRoom = emptyBattleRoom
      console.log(emptyBattleRoom)
      socket.join(gameRoom);
      console.log(`Client ${socket.id} joined ${gameRoom}`);
      connectedBattleClients = 0;

      battleRooms.get(gameRoom).player2 = data.username

      const roomSockets = io.sockets.adapter.rooms.get(gameRoom);
      if (roomSockets) {
        roomSockets.forEach((clientId) => {
          const socket = io.sockets.sockets.get(clientId);
          const message = `Hello, client ${clientId}!`;

          socket.emit('ready', { 
            msg: message, 
            nextPokemon: battleRooms.get(gameRoom).allRegion.getNextPokemon(),
            player1: battleRooms.get(gameRoom).player1,
            player2: battleRooms.get(gameRoom).player2
          });
        });
      }
    }
  });

  socket.on('caughtFirst', (data) => {
    console.log("caught first!")
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    battleRooms.get(joinedRooms[0]).allRegion.removeLastPokemon()

    if (battleRooms.get(joinedRooms[0]).pending === true) {
      battleRooms.get(joinedRooms[0]).pending = false
      return
    }
    else {
      battleRooms.get(joinedRooms[0]).pending = true
    }

    roomSockets.forEach((otherSocketId) => {
        const otherSocket = io.to(otherSocketId);
        otherSocket.emit('roundWinner', {
          msg: `${data.username} won the round!`
        })
        otherSocket.emit('nextBattle', { 
          winnerOfRound: data.username,
          nextPokemon: battleRooms.get(joinedRooms[0]).allRegion.getNextPokemon(),
          pokemonCaught: data.pokemonCaught,
          playerNum: data.winner
        });
    });
    setTimeout(() => {
      battleRooms.get(joinedRooms[0]).pending = false
    }, 2000);
    
  })

  socket.on('caughtPokemon', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    const totalPokemonIndexSet = gameRooms.get(joinedRooms[0]).totalPokemonIndexSet
    console.log("----------------------")
    console.log(joinedRooms)
    console.log(`Client ${socket.id} is in rooms:`, joinedRooms[0]);
    gameRooms.get(joinedRooms[0]).totalPokemonIndexSet.add(data.caughtPokemonIndex)
    gameRooms.get(joinedRooms[0]).allRegion.addPokemonCaught(data.caughtPokemonMiniImg)
    if (data.currentRegion == 'kanto') {
      gameRooms.get(joinedRooms[0]).kanto.addPokemonCaught(data.caughtPokemonMiniImg)
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).kanto.getNextPokemon(totalPokemonIndexSet)
      })
    }
    else if (data.currentRegion == 'johto') {
      gameRooms.get(joinedRooms[0]).johto.addPokemonCaught(data.caughtPokemonMiniImg)
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).johto.getNextPokemon(totalPokemonIndexSet)
      })
    }
    else if (data.currentRegion == 'hoenn') {
      gameRooms.get(joinedRooms[0]).hoenn.addPokemonCaught(data.caughtPokemonMiniImg)
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).hoenn.getNextPokemon(totalPokemonIndexSet)
      })
    }
    else if (data.currentRegion == 'sinnoh') {
      gameRooms.get(joinedRooms[0]).sinnoh.addPokemonCaught(data.caughtPokemonMiniImg)
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).sinnoh.getNextPokemon(totalPokemonIndexSet)
      })
    }
    else if (data.currentRegion == 'allRegion') {
      //gameRooms.get(joinedRooms[0]).allRegion.addPokemonCaught(data.caughtPokemonMiniImg)
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).allRegion.getNextPokemon(totalPokemonIndexSet)
      })
    }


    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.caughtPokemonMiniImg,
          currentRegion: data.currentRegion
        });
      }
    });
  });

  socket.on('changeRegion', (data) =>{

  

    
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    const totalPokemonIndexSet = gameRooms.get(joinedRooms[0]).totalPokemonIndexSet
    if (data.oldRegion == 'kanto') {
      gameRooms.get(joinedRooms[0]).kanto.addPokemonToOrder(data?.currentPokemonIndex)
    }
    else if (data.oldRegion == 'johto') {
      gameRooms.get(joinedRooms[0]).johto.addPokemonToOrder(data?.currentPokemonIndex)
    }
    else if (data.oldRegion == 'hoenn') {
      gameRooms.get(joinedRooms[0]).hoenn.addPokemonToOrder(data?.currentPokemonIndex)
    }
    else if (data.oldRegion == 'sinnoh') {
      gameRooms.get(joinedRooms[0]).sinnoh.addPokemonToOrder(data?.currentPokemonIndex)
    }
    else if (data.oldRegion == 'allRegion') {
      gameRooms.get(joinedRooms[0]).allRegion.addPokemonToOrder(data?.currentPokemonIndex)
    }


    console.log(data.newRegion + "no way")
    if (data.newRegion == 'kanto') {
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).kanto.getNextPokemon(totalPokemonIndexSet)
      })
      socket.emit('syncNewRegionPokemon', {
        newPokemonCaught: gameRooms.get(joinedRooms[0]).kanto.getPokemonCaught()
      })
    }
    else if (data.newRegion == 'johto') {
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).johto.getNextPokemon(totalPokemonIndexSet)
      })
      socket.emit('syncNewRegionPokemon', {
        newPokemonCaught: gameRooms.get(joinedRooms[0]).johto.getPokemonCaught()
      })
    }
    else if (data.newRegion == 'hoenn') {
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).hoenn.getNextPokemon(totalPokemonIndexSet)
      })
      socket.emit('syncNewRegionPokemon', {
        newPokemonCaught: gameRooms.get(joinedRooms[0]).hoenn.getPokemonCaught()
      })
    }
    else if (data.newRegion == 'sinnoh') {
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).sinnoh.getNextPokemon(totalPokemonIndexSet)
      })
      socket.emit('syncNewRegionPokemon', {
        newPokemonCaught: gameRooms.get(joinedRooms[0]).sinnoh.getPokemonCaught()
      })
    }
    else if (data.newRegion == 'allRegion') {
      socket.emit('recievePokemon', {
        nextPokemonIndex: gameRooms.get(joinedRooms[0]).allRegion.getNextPokemon(totalPokemonIndexSet)
      })
      socket.emit('syncNewRegionPokemon', {
        newPokemonCaught: gameRooms.get(joinedRooms[0]).allRegion.getPokemonCaught()
      })
    }

  })

  socket.on('addKanto', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    gameRooms.get(joinedRooms[0]).hoenn.addPokemonCaught(data.pokemonMiniImg)
    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.pokemonMiniImg,
          currentRegion: 'kanto'
        });
      }
    });
  })

  socket.on('addJohto', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    gameRooms.get(joinedRooms[0]).hoenn.addPokemonCaught(data.pokemonMiniImg)
    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.pokemonMiniImg,
          currentRegion: 'johto'
        });
      }
    });
  })

  socket.on('addHoenn', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    gameRooms.get(joinedRooms[0]).hoenn.addPokemonCaught(data.pokemonMiniImg)
    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.pokemonMiniImg,
          currentRegion: 'hoenn'
        });
      }
    });
  })

  socket.on('addSinnoh', (data) => {
    const joinedRooms = []
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        joinedRooms.push(room);
      }
    });
    gameRooms.get(joinedRooms[0]).hoenn.addPokemonCaught(data.pokemonMiniImg)
    const roomSockets: string[] = getSocketsInRoom(joinedRooms[0])
    // Emit the message to all other sockets in the room except the current socket
    console.log(roomSockets)
    //const baseImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/"
    roomSockets.forEach((otherSocketId) => {
      if (otherSocketId !== socket.id) {
        const otherSocket = io.to(otherSocketId);
        console.log(data.caughtPokemonMiniImg)
        otherSocket.emit('syncPokemon', {
          otherPokemon: data.pokemonMiniImg,
          currentRegion: 'sinnoh'
        });
      }
    });
  })
  
  

  // Check if there are two connected clients
  
  socket.on('disconnecting', () => {
    console.log('a user disconnecting');
    // Remove the game room if it becomes empty
    if (connectedClients === 1) {
      connectedClients--;
    }
    if (connectedBattleClients === 1) {
      connectedBattleClients--;
    }
    const joinedRooms = []
    //console.log(socket.rooms)

    // for (let i = 0; i < socket.rooms.size; i++) {
    //   if (socket.rooms[i] !== socket.id) {
    //     socket.to(socket.rooms[i]).emit("user has left", socket.id);
    //     // console.log(room)
    //     io.of('/').in(socket.rooms[i]).disconnectSockets(true)
    //     //delete io.sockets.adapter.rooms[socket.rooms[i]]
    //   }
    // }
    // socket.leave(socket.rooms[i])
    //console.log(io.sockets.adapter.rooms)
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room)
        socket.to(room).emit("user has left", socket.id);
        // console.log(room)
        io.of('/').in(room).disconnectSockets(true)
        //console.log("testtt" + io.sockets.adapter.rooms[room])
        //delete io.sockets.adapter.rooms[room]  //no need auto mem mangement
        //console.log(io.sockets.adapter.rooms)
        }
    })
    //console.log(io.sockets.adapter.rooms)
  });
});
  
http.listen(8080, () => {
  console.log(`Server is listening on 0.0.0.0:8080`);
});
  
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