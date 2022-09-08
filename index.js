require("dotenv").config();
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require("cors");

const db = require("./source/database");
db.connect();

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
  },
  allowEIO3: true
});

const userRoutes = require("./source/routes/users");
const chatRoutes = require("./source/routes/chats");
const { findChat, startChat } = require('./source/helpers/users');

// app.use(express.static("public"));
// app.use(helmet());
// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

app.use(express.json());
app.use(cors({credentials: true, origin: ['http://localhost:5000' ,'http://localhost:3000',]}));

app.get("/", (_, res) => {
  res.status(200).send("Lexar Online");
});

app.use(userRoutes);
app.use(chatRoutes);

io.on('connect', (socket) => {
  socket.on('join', async ({ from, to }, callback) => {
    const { error, chat } = await startChat({chatSocketId: socket.id, from, to })
    if(error) return callback({status: 'error', error});

    socket.join(chat.chatId);
    callback({status: 'success' });

    socket.emit('publicMessage', 'Welcome');
    socket.broadcast.to(chat.chatId).emit('statusUpdate', { text: `${from} is Online!` });
  });

  socket.on('sendMessage', async ({from, to, message}, callback) => {
    const {error, chat } = await findChat({ from, to, message});
    if(error) return callback(error);
    io.to(chat.chatId).emit('message', { from, message });

  });

  // socket.on('disconnect', (user) => {
    // const chats = await findAllChatsOfUser(user.email)
    // chats.forEach((chat) => {
    //   socket.broadcast.to(chat.chatId).emit('statusUpdate', { text: `${from} is Offline!` });
    // });
  // })
});

const hostname = "127.0.0.1";
const port = process.env.PORT || 7000;

server.listen(port, hostname, () => {
  console.log(`Server has started`);
});
