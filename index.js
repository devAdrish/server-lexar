require("dotenv").config();
const express = require("express");
const app = express();
// const http = require('http');
// const socketio = require('socket.io');
const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const { addUser, removeUser, getUser, getUsersInRoom } = require('./source/utils');
// const { getUser, startChat } = require('./source/helpers/users');

const db = require("./source/database");
db.connect();

// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5001');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
app.use(express.json());
// const server = http.createServer(app, {
//   cors: {
//     origin: '*'
//   }
// });
// const io = socketio(server);

app.use(cors());
// app.use(express.static("public"));
// app.use(helmet());
// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

const userRoutes = require("./source/routes/users");

app.get("/", (_, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // res.header("Access-Control-Allow-Headers", '*');
  res.status(200).send("Home");
});

app.get("/status", (_, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // res.header("Access-Control-Allow-Headers", '*');
  res.status(200).send("Lexar Statused");
});



// app.use(chatRoutes);
app.use(userRoutes);

// io.on('connect', (socket) => {
//   socket.on('join', async ({ message, from, to, time }, callback) => {
//     const { error, chat } = startChat({chatSocketId: socket.id, message, from, to, time })
//     if(error) return callback(error);

//     socket.join(chat.chatId);

//     socket.emit('message', { user: 'admin', message: `${from}, welcome to room ${chat.chatId}.`});
//     socket.broadcast.to(chat.chatId).emit('status update', { text: `${from} is Online!` });

//     // io.to(chat.chatId).emit('roomData', { room: chat.chatId, users: getUsersInRoom(user.room) });

//     callback();
//   });

//   socket.on('sendMessage', (message, callback) => {
//     const user = getUser(socket.id);
    
//     io.to(chat.chatId).emit('message', { user: user.name, text: message });

//     callback();
//   });

//   socket.on('disconnect', () => {
//     // const user = removeUser(socket.id);

//     // if(user) {
//     //   io.to(chat.chatId).emit('message', { user: 'Admin', text: `${user.name} has left.` });
//     //   io.to(chat.chatId).emit('roomData', { room: chat.chatId, users: getUsersInRoom(chat.chatId)});
//     // }
//   })
// });

const hostname = "127.0.0.1";
const port = process.env.PORT || 7000;

app.listen(port, hostname, () => {
  console.log(`Server has started`);
});
