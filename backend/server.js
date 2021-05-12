require("dotenv").config();

const express = require("express");
const twilio = require("./Twilio");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const PORT = 3001;

app.get("/test", (req, res) => {
  res.send("Welcome to Twilio");
});

app.post("/login", async (req, res) => {
  try {
    console.log("logging in");
    const { to, username, channel } = req.body;
    const data = await twilio.sendVerifyAsync(to, channel);
    res.send(data);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/verify", async (req, res) => {
  try {
    console.log("verifying code");
    const { to, code } = req.body;
    const data = await twilio.verifyCodeAsync(to, code);
    res.send(data);
  } catch (error) {
    console.log(error.message);
  }
});

server.listen(PORT, () => {
  console.log("##########################");
  console.log(`Listening on port ${PORT}`);
  console.log("##########################");
  console.log(`http://localhost:${PORT}`);
  console.log("##########################");
});
