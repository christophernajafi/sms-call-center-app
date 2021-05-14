import { Fragment, useEffect } from "react";
import Login from "./components/Login";
import { useImmer } from "use-immer";
import axios from "./utils/Axios";
import socket from "./utils/SocketIo";
import useLocalStorage from "./hooks/useLocalStorage";
import CallCenter from "./components/CallCenter";

function App() {
  const [calls, setCalls] = useImmer({
    calls: [],
  });

  const [user, setUser] = useImmer({
    username: "",
    mobileNumber: "",
    verificationCode: "",
    verificationSent: false,
  });

  const [storedToken, setStoredToken] = useLocalStorage("token", null);

  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("Socket disconnected");
    // });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    return () => {};
  }, []);

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
      {storedToken ? (
        <CallCenter calls={calls} />
      ) : (
        <Fragment>
          <CallCenter calls={calls} />
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
}

export default App;
