import { createServer } from "http";
import { Server } from "socket.io";

const http = createServer();
const io = new Server(http, {
    cors: { origin: "*" }
  });

const chatMessages: string[] = []; // Collection to store chat messages
let connectedClients: number = 0; // Number of connected clients
let gameRooms: string[] = []; // Array to store game room names


io.on('connection', (socket) => {
  console.log('a user connected');
  connectedClients++;

  if (connectedClients === 1) {
    // Create a new game room and join it
    const gameRoom = `GameRoom${gameRooms.length}`;
    gameRooms.push(gameRoom);

    // Join the game room
    socket.join(gameRoom);
    console.log(`Client ${socket.id} joined ${gameRoom}`);
  }
  
  else if (connectedClients === 2) {
    // Join the game room
    socket.join(`GameRoom${gameRooms.length}`);
    console.log(`Client ${socket.id} joined ${gameRooms}`);
    connectedClients = 0

    io.to(gameRoom).emit('ready', `Both clients connected to ${gameRoom}, the total is ${connectedClients}`);
  }
  // Check if there are two connected clients
  
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    connectedClients--;

    // Remove the game room if it becomes empty
    if (connectedClients === 0) {
      const gameRoom = gameRooms.pop();
      console.log(`Game room ${gameRoom} removed`);
    }
  });
});
  
  http.listen(8080, () => console.log('listening on http://localhost:8080'));
  
  
  
  // Regular Websockets
  
  // const WebSocket = require('ws')
  // const server = new WebSocket.Server({ port: '8080' })
  
  // server.on('connection', socket => { 
  
  //   socket.on('message', message => {
  
  //     socket.send(`Roger that! ${message}`);
  
  //   });
  
  // });