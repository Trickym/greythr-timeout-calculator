/*global chrome*/
import busVector from "./greythr_image1.svg";
import gotoAttendance from "./go_to_attendance.png";
import noPunch from "./no_punch.png";
import Logo from "./greytip_logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import moment from "moment";

function App() {
  const [text, setText] = useState("Loading..."); // Initial state message
  const [notGreyt, setNotGreyt] = useState(false);
  const [noPunchInTime, setNotPunchInTime] = useState(false);
  const [punchOutTime, setPunchOutTime] = useState();
  const [date, setDate] = useState("");
  const [workingHours, setWorkingHours] = useState(
    localStorage.getItem("workingHours")
  );
  const [localOn, setLocalOn] = useState(false);
  const [inputHour, setInputHour] = useState(8);
  const [inputMinute, setInputMinute] = useState(30);
  function handleChange(e) {
    let value = Number(e.target.value);
    if (e.target.name === "hour") {
      setInputHour(value > 12 ? 12 : Number(value));
    } else {
      setInputMinute(value > 59 ? 0 : Number(value));
    }
  }
  function getMonthByName(monthName) {
    const monthMoment = moment(monthName, "MMMM", "en");
    let monthNumber = monthMoment.month() + 1;
    if (monthNumber < 10) {
      return `0${monthNumber}`;
    }
    return monthNumber;
  }
  useEffect(() => {
    if (workingHours) {
      if (localStorage.getItem("date")) {
        let date = JSON.parse(localStorage.getItem("date"));
        let selectedDateMoment = moment(date, "YYYY-MM-DD");
        let todayDate = moment().startOf("day");
        let isToday = selectedDateMoment.isSame(todayDate, "day");
        if (!isToday) {
          localStorage.removeItem("date");
          localStorage.removeItem("punch_out_time");
          localStorage.removeItem("no_punch_in");
          localStorage.removeItem("text");
        }
      }
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
          if (response && response?.in_time) {
            let inputTime = response?.in_time;
            const parsedTime = moment(inputTime, "hh:mm:ss a");
            const hourOfWork = Number(workingHours?.split(":")[0]);
            const minutesOfWork = Number(workingHours?.split(":")[1]);
            const calculatedTime = parsedTime.add({
              hours: hourOfWork,
              minutes: minutesOfWork,
            });
            const result = calculatedTime.format("hh:mm:ss a");
            const workingHoursCalculated = moment(
              `${workingHours} pm`,
              "hh:mm:ss a"
            );
            const isGreaterThanWorkingHours = calculatedTime.isAfter(
              workingHoursCalculated
            );

            if (isGreaterThanWorkingHours) {
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
                setDate(JSON.parse(localStorage.getItem("date")));
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
    }
  }, [workingHours]);

  function handleProceed() {
    let time = `${inputHour?.toString()?.padStart(2, 0)}:${inputMinute
      ?.toString()
      ?.padStart(2, 0)}:00`;
    setWorkingHours(time);
    localStorage.setItem("workingHours", time);
  }

  return (
    <div className="popup">
      <img style={{ marginTop: "10px" }} src={Logo} height={30} alt="logo" />
      <>
        {!workingHours ? (
          <>
            <p style={{ fontSize: "16px", marginBottom: 0 }}>
              Enter Working Hours
            </p>
            <p style={{ fontSize: "10px", marginTop: 0 }}>
              **use up/down arrows to change the value
            </p>
            <div className="input-container">
              <input
                onChange={handleChange}
                name="hour"
                value={inputHour?.toString()?.padStart(2, 0)}
                className="custom-select"
                type="number"
                min={1}
                max={12}
              />
              <input
                onChange={handleChange}
                name="minute"
                value={inputMinute?.toString()?.padStart(2, 0)}
                className="custom-select"
                type="number"
                min={0}
                max={59}
              />
            </div>
            <div className="button-container">
              <button class="cssbuttons-io-button" onClick={handleProceed}>
                Save & Proceed
                <div class="icon">
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
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
                <h2>{punchOutTime}</h2>
                <h3>{moment(date).format("DD MMM YYYY")}</h3>
                {punchOutTime && <img src={busVector} alt="bus" />}
              </>
            )}
          </>
        )}
      </>
    </div>
  );
}

export default App;
