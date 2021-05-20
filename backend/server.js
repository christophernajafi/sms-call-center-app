require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const twilio = require("./Twilio");
const jwt = require("./utils/Jwt");
const { getAccessTokenForVoice } = require("./Twilio");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

io.use((socket, next) => {
  console.log("Socket middleware");
  if (socket.handshake.query && socket.handshake.query.token) {
    const { token } = socket.handshake.query;
    try {
      const result = jwt.verifyToken(token);
      if (result.username) return next();
    } catch (error) {
      console.log(error);
    }
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.emit("twilio-token", { token: getAccessTokenForVoice("chris") });
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
  socket.on("answer-call", ({ sid }) => {
    console.log("Answering call with sid", sid);
    twilio.answerCall(sid);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const PORT = 3001;

app.get("/test", (req, res) => {
  res.send("Welcome to Twilio");
});

app.post("/check-token", (req, res) => {
  const { token } = req.body;
  let isValid = false;
  try {
    isValid = jwt.verifyToken(token);
  } catch (error) {
    console.log(error);
  }
  res.send({ isValid });
});

app.post("/login", async (req, res) => {
  try {
    console.log("logging in");
    const { to, username, channel } = req.body;
    const data = await twilio.sendVerifyAsync(to, channel);
    res.send("Send code");
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/verify", async (req, res) => {
  try {
    console.log("verifying code");
    const { to, code, username } = req.body;
    const data = await twilio.verifyCodeAsync(to, code);
    if (data.status == "approved") {
      const token = jwt.createJwt(username);
      return res.send({ token });
    }
    res.status(401).send("Invalid token");
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/call-new", (req, res) => {
  console.log("receive a new call");
  io.emit("call-new", { data: req.body });
  const response = twilio.voiceResponse(
    "Thank you for your call! Please stand by until the next customer service agent is available."
  );
  res.type("text/xml");
  res.send(response.toString());
});

app.post("/call-status-changed", (req, res) => {
  console.log("Call status changes");
  res.send("ok");
});

app.post("/enqueue", (req, res) => {
  const response = twilio.enqueueCall("Customer Service");
  console.log("Enqueuing call");
  io.emit("enqueue", { data: req.body });
  console.log("data: ", req.body);
  res.type("text/xml");
  res.send(response.toString());
});

app.post("/connect-call", (req, res) => {
  console.log("Connecting call");
  const response = twilio.redirectCall("chris");
  res.type("text/xml");
  res.send(response.toString());
});

server.listen(PORT, () => {
  console.log("##########################");
  console.log(`Listening on Port: ${PORT}`);
  console.log("##########################");
  console.log(`http://localhost:${PORT}`);
  console.log("##########################");
});
