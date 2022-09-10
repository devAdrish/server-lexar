require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const db = require("./source/database");
db.connect();

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

const userRoutes = require("./source/routes/users");
const chatRoutes = require("./source/routes/chats");
const {
  updateChatMessages,
  startChat,
  updateUserStatus,
} = require("./source/helpers/users");

// app.use(express.static("public"));
// app.use(helmet());
// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

app.use(express.json());
app.use(cors({ credentials: true, origin: "*" }));

app.get("/", (_, res) => {
  res.status(200).send("Lexar Online");
});

app.use(userRoutes);
app.use(chatRoutes);

io.on("connect", async (socket) => {
  const handshakeData = socket.request;
  const { email } = handshakeData._query;
  updateUserStatus({ email, status: true, socketId: socket.id, io });

  socket.on("join", async ({ from, to }, callback) => {
    try {
      const { error, chatId, text } = await startChat({
        from,
        to,
      });
      if (error) return callback({ status: "error", text });
      socket.join(chatId);
      callback({ status: "success" });
    } catch (_) {}
  });

  socket.on("sendMessage", async ({ from, to, message }, callback) => {
    try {
      const { error, chatId, text } = await updateChatMessages({
        from,
        to,
        message,
      });
      if (error) return callback({ status: "error", text });
      socket.to(chatId).emit("message", { from, message });
    } catch (_) {}
  });

  socket.on("disconnect", () => {
    updateUserStatus({ email, status: false, socketId: socket.id, io });
  });
});

const PORT = process.env.PORT || 7000;

server.listen(PORT, () => {
  console.log(`Server has started`);
});
