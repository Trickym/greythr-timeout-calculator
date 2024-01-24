/*global chrome*/
import logo from "./logo.svg";
import busVector from "./greythr_image1.svg";
import gotoAttendance from "./go_to_attendance.png";
import noPunch from "./no_punch.png";
import Logo from "./greytip_logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";

function App() {
  const [text, setText] = useState("Loading..."); // Initial state message
  const [loading, setLoading] = useState(true);
  const [notGreyt, setNotGreyt] = useState(false);
  const [noPunchInTime, setNotPunchInTime] = useState(false);
  const [punchOutTime, setPunchOutTime] = useState();
  const [date, setDate] = useState("");
  const [localOn, setLocalOn] = useState(false);
  function getMonthByName(monthName) {
    const monthMoment = moment(monthName, "MMMM", "en");
    let monthNumber = monthMoment.month() + 1;
    if (monthNumber < 10) {
      return `0${monthNumber}`;
    }
    return monthNumber;
  }
  useEffect(() => {
    if (localStorage.getItem("date")) {
      let date = JSON.parse(localStorage.getItem("date"));
      let selectedDateMoment = moment(date, "YYYY-MM-DD");
      let todayDate = moment().startOf("day");
      let isToday = selectedDateMoment.isSame(todayDate, "day");
      if (!isToday) {
        localStorage.clear();
      }
    }
    // Replace "YOUR_EXTENSION_ID" with your actual extension ID
    chrome.runtime.sendMessage(
      "cbkjckmlkdilmgahkaiaegigmfkfgbcg",
      { action: "fetchElement" },
      (response) => {
        console.log(response);
        let month = getMonthByName(response?.presentMonth?.split(" ")[0]);
        let year = response?.presentMonth?.split(" ")[1];
        let day = response?.day;
        let selectedDate = `${year}-${month}-${day}`;
        setDate(selectedDate);
        let selectedDateMoment = moment(selectedDate, "YYYY-MM-DD");
        let todayDate = moment().startOf("day");
        let isTodayDateSelected = selectedDateMoment.isSame(todayDate, "day");
        console.log({ selectedDate, todayDate, isTodayDateSelected });
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
            if (isTodayDateSelected) {
              localStorage.setItem("date", JSON.stringify(selectedDate));
              localStorage.setItem("no_punch_in", JSON.stringify(true));
              localStorage.setItem(
                "text",
                JSON.stringify("Seems like you forgot to punch in!")
              );
              setLocalOn(true);
            } else {
              setLocalOn(false);
            }
            setText("Seems like you forgot to punch in!");
          } else {
            if (isTodayDateSelected) {
              localStorage.setItem("date", JSON.stringify(selectedDate));
              localStorage.setItem("no_punch_in", JSON.stringify(false));
              localStorage.setItem("punch_out_time", JSON.stringify(result));
              localStorage.setItem(
                "text",
                JSON.stringify("Your punch out time")
              );
              setLocalOn(true);
            } else {
              setLocalOn(false);
            }
            setText(
              response?.in_time ? "Your punch out time" : "Data not found"
            );
            setPunchOutTime(result);
          }
        } else {
          console.error("Error:", response?.error || "No response");
          if (response?.samePage) {
            if (response?.notPunchData) {
              if (isTodayDateSelected) {
                localStorage.setItem("date", JSON.stringify(selectedDate));
                localStorage.setItem("no_punch_in", JSON.stringify(true));
                localStorage.setItem(
                  "text",
                  JSON.stringify("Seems like you forgot to punch in!")
                );
                setLocalOn(true);
              } else {
                setLocalOn(false);
              }
              setNotPunchInTime(true);
              setText("Seems like you forgot to punch in!");
            }
          } else {
            if (localStorage.getItem("text")) {
              setPunchOutTime(
                JSON.parse(localStorage.getItem("punch_out_time"))
              );
              setNotPunchInTime(
                JSON.parse(localStorage.getItem("no_punch_in"))
              );
              setText(JSON.parse(localStorage.getItem("text")));
            } else {
              setNotGreyt(true);
              setText(
                "You need to route to the Attendance Info page in your greythr portal."
              );
            }
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
          <h2>{moment(date).format("DD MMM YYYY")}</h2>
          <h3>{punchOutTime}</h3>
          {punchOutTime && <img src={busVector} alt="bus" />}
        </>
      )}
    </div>
  );
}

export default App;
