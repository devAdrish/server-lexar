require("dotenv").config();
const express = require("express");
const app = express();
// const http = require("http");

const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

const db = require("./source/database");
db.connect();

app.use(express.json());
app.use(cors());
// // app.use(express.static("public"));
// app.use(cors({
//   origin:'*',
//    credentials:true,            //access-control-allow-credentials:true
//    optionSuccessStatus:200,
// }));

// app.use(helmet());

const userRoutes = require("./source/routes/users");
const chatRoutes = require("./source/routes/chats");

// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

app.get("/", (_, res) => {
  res.status(200).send("Lexar");
});

// app.get("/test/:id", (req, res) => {
//   res.status(200).send(req.params.id);
// });

// app.use((req, res, next) => {
//   console.log('request', req)
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
//   console.log('passed')

// }
// );
app.use(function(_, res, next){
  res.io = io;
  next();
});

app.use(chatRoutes);
app.use(userRoutes);

const hostname = "127.0.0.1";
const port = process.env.PORT || 5000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// SOCKET
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const socketport = process.env.SOCKET_PORT || 8080;
// io.use((socket, next) => {
//   const sessionID = socket.handshake.auth.sessionID;
//   if (sessionID) {
//     // find existing session
//     const session = sessionStore.findSession(sessionID);
//     if (session) {
//       socket.sessionID = sessionID;
//       socket.userID = session.userID;
//       socket.username = session.username;
//       return next();
//     }
//   }
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   // create new session
//   socket.sessionID = randomId();
//   socket.userID = randomId();
//   socket.username = username;
//   next();
// });

io.of("/chat").on("connection", (socket) => {
  // console.log(socket.id);
  io.emit('msg', 'Welcome')
  io.of("/chat").to(socket.id).emit('msg', `hey @${Date.now().toString()}`)
});

server.listen(socketport, hostname, () => {
  console.log(`Socket.IO server running at http://${hostname}:${socketport}/`);
});
