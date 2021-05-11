require("dotenv").config();

const express = require("express");
const twilio = require("./Twilio");

const app = express();
const PORT = 3001;

app.get("/test", (req, res) => {
  res.send("Welcome to Twilio");
});

app.get("/login", async (req, res) => {
  try {
    res.send("logging in");
    const data = await twilio.sendVerifyAsync(process.env.MOBILE, "sms");
    res.send(data);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/verify", async (req, res) => {
  try {
    res.send("verifying code");
    const data = await twilio.verifyCodeAsync(
      process.env.MOBILE,
      req.query.code
    );
    return data;
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(PORT, () => {
  console.log("##########################");
  console.log(`Listening on port ${PORT}`);
  console.log("##########################");
  console.log(`http://localhost:${PORT}`);
  console.log("##########################");
});
