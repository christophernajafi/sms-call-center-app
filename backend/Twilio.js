require("dotenv").config();

const twilio = require("twilio");
const VoiceResponse = require("twilio/lib/twiml/VoiceResponse");

class Twilio {
  phoneNumber = process.env.PHONE_NUMBER;
  phoneNumberSid = process.env.PHONE_NUMBER_ID;
  tokenSid = process.env.TOKEN_SID;
  tokenSecret = process.env.TOKEN_SECRET;
  accountSid = process.env.ACCOUNT_SID;
  verify = process.env.VERIFY;
  outgoingApplicationSid = process.env.TWIML_SID;
  client;
  constructor() {
    this.client = twilio(this.tokenSid, this.tokenSecret, {
      accountSid: this.accountSid,
    });
  }
  getTwilio() {
    this.client;
  }

  async sendVerifyAsync(to, channel) {
    try {
      const data = await this.client.verify
        .services(this.verify)
        .verifications.create({
          to,
          channel,
        });
      console.log("sendVerify");
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }

  async verifyCodeAsync(to, code) {
    try {
      const data = await this.client.verify
        .services(this.verify)
        .verificationChecks.create({
          to,
          code,
        });
      console.log("verifyCode");
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }

  voiceResponse(message) {
    const twiml = new VoiceResponse();
    twiml.say(
      {
        voice: "female",
      },
      message
    );
    twiml.redirect("https://cnajafi.loca.lt/enqueue");
    return twiml;
  }

  enqueueCall(queueName) {
    const twiml = new VoiceResponse();
    twiml.enqueue(queueName);
    return twiml;
  }

  redirectCall(client) {
    const twiml = new VoiceResponse();
    twiml.dial().client(client);
    return twiml;
  }

  answerCall(sid) {
    console.log("answerCall with sid", sid);
    this.client.calls(sid).update({
      url: "https://cnajafi.loca.lt/connect-call",
      method: "POST",
      function(err, call) {
        console.log("answerCall", call);
        if (err) {
          console.error("answerCall", err);
        }
      },
    });
  }

  getAccessTokenForVoice = (identity) => {
    console.log(`Access token for ${identity}`);
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    const outgoingAppSid = this.outgoingApplicationSid;
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingAppSid,
      incomingAllow: true,
    });
    const token = new AccessToken(
      this.accountSid,
      this.tokenSid,
      this.tokenSecret,
      { identity }
    );
    token.addGrant(voiceGrant);
    console.log("Access granted with JWT", token.toJwt());
    return token.toJwt();
  };
}

const instance = new Twilio();
Object.freeze(instance);

module.exports = instance;
