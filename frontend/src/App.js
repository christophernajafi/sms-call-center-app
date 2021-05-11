import Login from "./components/Login";
import { useImmer } from "use-immer";
import axios from "./utils/Axios";

function App() {
  const [user, setUser] = useImmer({
    username: "",
    mobileNumber: "",
  });

  const sendSmsCode = async () => {
    try {
      console.log("Sending SMS");
      await axios.post("/login", {
        to: user.mobileNumber,
        username: user.username,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <Login user={user} setUser={setUser} sendSmsCode={sendSmsCode} />
    </div>
  );
}

export default App;
