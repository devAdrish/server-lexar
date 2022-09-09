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
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
  },
  allowEIO3: true
});

const userRoutes = require("./source/routes/users");
const chatRoutes = require("./source/routes/chats");
const { updateChatMessages, startChat, findAllChatsOfUser } = require('./source/helpers/users');

// app.use(express.static("public"));
// app.use(helmet());
// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

app.use(express.json());
app.use(cors({credentials: true, origin: "*"}));

app.get("/", (_, res) => {
  res.status(200).send("Lexar Online");
});

app.use(userRoutes);
app.use(chatRoutes);

io.on('connect', (socket) => {
  socket.on('join', async ({ from, to }, callback) => {
    const { error, chatId, text } = await startChat({chatSocketId: socket.id, from, to })
    if(error) return callback({status: 'error', text});
    socket.join(chatId);
    callback({status: 'success'});

    const result = await findAllChatsOfUser(from)
    if(result.chats.length > 0)
    result.chats.forEach((chat) => {
      socket.broadcast.to(chat.chatId).emit('statusUpdate', { text: `${from} is Online!` });
    });
  });

  socket.on('sendMessage', async ({from, to, message}, callback) => {
    const { error, chatId, text } = await updateChatMessages({ from, to, message});
    if(error) return callback({status: 'error', text});
    io.to(chatId).emit('message', { from, message });
  });

  socket.on('disconnection', async (payload) => {
    const result = await findAllChatsOfUser(payload.user)
    if(result.chats.length > 0)
    result.chats.forEach((chat) => {
      socket.broadcast.to(chat.chatId).emit('statusUpdate', { text: `${payload.user} is Offline!` });
    });
  })
});

const hostname = "127.0.0.1";
const port = process.env.PORT || 7000;

server.listen(port, hostname, () => {
  console.log(`Server has started`);
});
