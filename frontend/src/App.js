import { Fragment, useEffect, useState } from "react";
import Login from "./components/Login";
import { useImmer } from "use-immer";
import axios from "./utils/Axios";
import socket from "./utils/SocketIo";
import useTokenFromLocalStorage from "./hooks/useTokenFromLocalStorage";
import CallCenter from "./components/CallCenter";
import * as Twilio from "twilio-client";

const App = () => {
  const [calls, setCalls] = useImmer({
    calls: [],
  });

  const [user, setUser] = useImmer({
    username: "",
    mobileNumber: "",
    verificationCode: "",
    verificationSent: false,
  });

  const [twilioToken, setTwilioToken] = useState();

  const [storedToken, setStoredToken, isValidToken] =
    useTokenFromLocalStorage(null);

  useEffect(() => {
    console.log("Twilio token changed");
    if (twilioToken) {
      connectTwilioVoiceClient(twilioToken);
    }
  }, [twilioToken]);

  useEffect(() => {
    if (isValidToken) {
      console.log("Valid token");
      return socket.addToken(storedToken);
    }
    console.log("invalid token");
    socket.removeToken();
  }, [isValidToken, storedToken]);

  useEffect(() => {
    socket.client.on("connect", () => {
      console.log("Connected");
    });
    socket.client.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socket.client.on("twilio-token", (data) => {
      console.log("Received token from backend");
      setTwilioToken(data.token);
    });
    socket.client.on("call-new", ({ data: CallSid, CallStatus }) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex((call) => call.CallSid === CallSid);
        if (index === -1) {
          draft.calls.push({ CallSid, CallStatus });
        }
      });
    });
    socket.client.on("enqueue", ({ data }) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex(
          ({ CallSid }) => CallSid === data.CallSid
        );
        if (index === -1) {
          return;
        }
        draft.calls[index].CallStatus = "enqueue";
      });
    });
    return () => {};
  }, [setCalls]);

  const sendSmsCode = async () => {
    try {
      console.log("Sending SMS");
      await axios.post("/login", {
        to: user.mobileNumber,
        username: user.username,
        channel: "sms",
      });
      setUser((draft) => {
        draft.verificationSent = true;
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const connectTwilioVoiceClient = (twilioToken) => {
    const device = new Twilio.Device(twilioToken, { debug: true });
    device.on("error", (error) => {
      console.error(error);
    });
    device.on("incoming", (connection) => {
      console.log("Incoming from Twilio");
      connection.accept();
    });
  };

  const sendVerificationCode = async () => {
    try {
      console.log("Sending verification");
      const { data } = await axios.post("/verify", {
        to: user.mobileNumber,
        code: user.verificationCode,
        username: user.username,
      });
      console.log("received token", data.token);
      setStoredToken(data.token);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Fragment>
      {isValidToken ? (
        <CallCenter calls={calls} />
      ) : (
        <Fragment>
          <Login
            user={user}
            setUser={setUser}
            sendSmsCode={sendSmsCode}
            sendVerificationCode={sendVerificationCode}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default App;
