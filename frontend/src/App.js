import Login from "./components/Login";
import { useImmer } from "use-immer";
import axios from "./utils/Axios";

function App() {
  const [user, setUser] = useImmer({
    username: "",
    mobileNumber: "",
    verificationCode: "",
    verificationSent: false,
  });

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
      });
      console.log("verification response: ", data);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <Login
        user={user}
        setUser={setUser}
        sendSmsCode={sendSmsCode}
        sendVerificationCode={sendVerificationCode}
      />
    </div>
  );
}

export default App;
