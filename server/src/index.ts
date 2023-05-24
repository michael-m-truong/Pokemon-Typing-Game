import { createServer } from "http";
import { Server } from "socket.io";

const http = createServer();
const io = new Server(http, {
    cors: { origin: "*" }
  });

const chatMessages: string[] = []; // Collection to store chat messages
let connectedClients: number = 0; // Number of connected clients

io.on('connection', (socket) => {
    console.log('a user connected');
    connectedClients++;
  
    // Check if there are two connected clients
    if (connectedClients === 2) {
      io.emit('ready', 'Both clients connected'); // Emit a message when two clients are connected
    }
  
    socket.on('disconnect', () => {
      console.log('a user disconnected');
      connectedClients--;
    });
  
    // Send previous chat messages to the newly connected client
    // socket.emit('chatHistory', chatMessages);
  
    // socket.on('message', (message) => {
    //   console.log(message);
    //   const chatMessage = `${socket.id.substr(0, 2)} said ${message}`;
    //   chatMessages.push(chatMessage); // Store the new chat message
    //   io.emit('message', chatMessage);
    // });
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