/*global chrome*/
import logo from "./logo.svg";
import busVector from "./greythr_image1.svg";
import gotoAttendance from "./go_to_attendance.png";
import noPunch from "./no_punch.png";
import Logo from "./greytip_logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import moment from "moment";

function App() {
  const [text, setText] = useState("Loading..."); // Initial state message
  const [loading, setLoading] = useState(true);
  const [notGreyt, setNotGreyt] = useState(false);
  const [noPunchInTime, setNotPunchInTime] = useState(false);
  const [punchOutTime, setPunchOutTime] = useState();
  useEffect(() => {
    // Replace "YOUR_EXTENSION_ID" with your actual extension ID
    chrome.runtime.sendMessage(
      "cbkjckmlkdilmgahkaiaegigmfkfgbcg",
      { action: "fetchElement" },
      (response) => {
        console.log(response);
        if (response && response?.in_time) {
          let inputTime = response?.in_time;
          const parsedTime = moment(inputTime, "hh:mm:ss a");
          const calculatedTime = parsedTime.add({ hours: 8, minutes: 30 });
          const result = calculatedTime.format("hh:mm:ss a");
          const sevenThirtyPM = moment("07:30:00 pm", "hh:mm:ss a");
          const isGreaterThanSevenThirtyPM =
            calculatedTime.isAfter(sevenThirtyPM);
          if (isGreaterThanSevenThirtyPM) {
            setNotPunchInTime(true);
            setText("Seems like you forgot to punch in!");
          } else {
            setText(
              response?.in_time ? "Your punch out time" : "Data not found"
            );
            setPunchOutTime(result);
          }
        } else {
          console.error("Error:", response?.error || "No response");
          if (response?.samePage) {
            if (response?.notPunchData) {
              setNotPunchInTime(true);
              setText("Seems like you forgot to punch in!");
            }
          } else {
            setNotGreyt(true);
            setText(
              "You need to route to the Attendance Info page in your greythr portal."
            );
          }
        }
      }
    );
  }, []);

  return (
    <div className="popup">
      <img style={{ marginTop: "10px" }} src={Logo} height={30} alt="logo" />
      {notGreyt && (
        <>
          <p style={{ padding: "10px" }}>{text}</p>
          <img src={gotoAttendance} alt="bus" />
        </>
      )}
      {noPunchInTime && (
        <>
          <h3>{text}</h3>
          <img src={noPunch} alt="noPunch" />
        </>
      )}
      {punchOutTime && (
        <>
          <h2>{text}</h2>
          <h3>{punchOutTime}</h3>
          {punchOutTime && <img src={busVector} alt="bus" />}
        </>
      )}
    </div>
  );
}

export default App;
