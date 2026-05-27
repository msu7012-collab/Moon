import { useState, useEffect } from "react";

const MEMBERS = [
  { id: "A", name: "문승연", color: "#1B6B47", bg: "#D4EDDA", border: "#9ADBBE", text: "#155238" },
  { id: "B", name: "전소언", color: "#1A4A7A", bg: "#D1ECF1", border: "#8EC9DC", text: "#0C3A5C" },
  { id: "C", name: "김예린", color: "#7A1B1B", bg: "#FDE2E4", border: "#F0AABB", text: "#5C0F0F" },
];

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}
function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function load(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {} 
}

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tab, setTab] = useState("calendar");
  const [schedules, setSchedules] = useState({});
  const [changes, setChanges] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [modal, setModal] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [activeMember, setActiveMember] = useState("A");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSchedules(load("ps:schedules") || {});
    setChanges(load("ps:changes") || []);
    setMeetings(load("ps:meetings") || []);
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) save("ps:schedules", schedules); }, [schedules, loaded]);
  useEffect(() => { if (loaded) save("ps:changes", changes); }, [changes, loaded]);
  useEffect(() => { if (loaded) save("ps:meetings", meetings); }, [meetings, loaded]);
  // ... (이하 동일)
