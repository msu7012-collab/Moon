bash

cat /mnt/user-data/outputs/src/App.jsx
출력

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

  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const openModal = (date, member) => {
    setModal({ date, member });
    setInputVal(schedules[date]?.[member] || "");
  };

  const submitSchedule = () => {
    if (!modal || !inputVal.trim()) { setModal(null); return; }
    const { date, member } = modal;
    const existing = schedules[date]?.[member];
    if (existing && existing !== inputVal.trim()) {
      setChanges(prev => [...prev, {
        id: Date.now(), date, member,
        original: existing, proposed: inputVal.trim(),
        status: "pending", timestamp: new Date().toLocaleString("ko-KR"),
      }]);
    } else {
      setSchedules(prev => ({ ...prev, [date]: { ...prev[date], [member]: inputVal.trim() } }));
    }
    setModal(null); setInputVal("");
  };

  const deleteSchedule = (date, member) => {
    setSchedules(prev => {
      const u = { ...prev };
      if (u[date]) { const d = { ...u[date] }; delete d[member]; u[date] = d; }
      return u;
    });
    setModal(null);
  };

  const approveChange = (id) => {
    const ch = changes.find(c => c.id === id);
    if (!ch) return;
    setSchedules(prev => ({ ...prev, [ch.date]: { ...prev[ch.date], [ch.member]: ch.proposed } }));
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status: "approved" } : c));
  };
  const rejectChange = (id) => setChanges(prev => prev.map(c => c.id === id ? { ...c, status: "rejected" } : c));

  const openMeetingModal = (date) => { setModal({ type: "meeting", date }); setInputVal("팀 회의"); };
  const submitMeeting = () => {
    if (!modal) return;
    setMeetings(prev => [...prev, { id: Date.now(), date: modal.date, title: inputVal.trim() || "팀 회의" }]);
    setModal(null); setInputVal("");
  };
  const deleteMeeting = (id) => setMeetings(prev => prev.filter(m => m.id !== id));

  const getCellData = (date) => ({
    schedules: schedules[date] || {},
    pending: changes.filter(c => c.date === date && c.status === "pending"),
    meetings: meetings.filter(m => m.date === date),
  });

  const getFreeDays = () => {
    const free = [];
    for (let d = 1; d <= totalDays; d++) {
      const date = toKey(year, month, d);
      const dow = new Date(year, month, d).getDay();
      if (dow === 0 || dow === 6) continue;
      const data = getCellData(date);
      if (!MEMBERS.some(m => data.schedules[m.id]) && data.meetings.length === 0) free.push({ date, d, dow });
    }
    return free;
  };

  const pendingCount = changes.filter(c => c.status === "pending").length;
  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };
  const mi = (id) => MEMBERS.find(m => m.id === id);

  const S = {
    wrap: { fontFamily: "'Apple SD Gothic Neo','Malgun Gothic',sans-serif", background: "#F7F5F2", minHeight: "100vh" },
    header: { background: "#fff", borderBottom: "1px solid #E8E4DF", padding: "18px 24px 0" },
    headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    tag: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#B0A89C", border: "1px solid #D8D4CC", padding: "4px 10px", borderRadius: 3 },
    h1: { fontSize: 18, fontWeight: 700, color: "#1C1C1C", margin: "4px 0 0", letterSpacing: "-0.02em" },
    monthNav: { display: "flex", alignItems: "center", gap: 10 },
    navBtn: { width: 32, height: 32, borderRadius: 8, border: "1px solid #E8E4DF", background: "#fff", cursor: "pointer", fontSize: 18, color: "#555" },
    monthLabel: { fontSize: 16, fontWeight: 700, color: "#1C1C1C", minWidth: 100, textAlign: "center" },
    tabs: { display: "flex" },
    tabBtn: (active) => ({ padding: "10px 16px", border: "none", background: "none", fontSize: 13, cursor: "pointer", borderBottom: active ? "2px solid #1B6B47" : "2px solid transparent", color: active ? "#1B6B47" : "#888", fontWeight: active ? 700 : 400, transition: "all 0.15s" }),
    body: { padding: "20px 24px" },
    memberRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" },
    calGrid: { background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px #EAE6E0" },
    dayHeaders: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #F0EBE5" },
    cells: { display: "grid", gridTemplateColumns: "repeat(7,1fr)" },
    chip: (m) => ({ fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: m.bg, color: m.text, fontWeight: 500, lineHeight: 1.4, border: `1px solid ${m.border}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
    meetChip: { fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 3, background: "#1B6B47", color: "#fff", fontWeight: 600, lineHeight: 1.4 },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 12 },
    emptyState: { background: "#fff", borderRadius: 12, padding: 32, textAlign: "center", color: "#BBB", fontSize: 14, border: "1px solid #EAE6E0" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
    modalBox: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
    input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E4DF", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    btnRow: { display: "flex", gap: 10, marginTop: 18 },
    primaryBtn: (color) => ({ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: color || "#1B6B47", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }),
    secondaryBtn: { padding: "10px 18px", borderRadius: 10, border: "1px solid #E8E4DF", background: "#fff", color: "#888", fontSize: 14, cursor: "pointer" },
    dangerBtn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #FECDD3", background: "#fff", color: "#9B1C1C", fontSize: 13, cursor: "pointer" },
    approveBtn: { padding: "7px 14px", borderRadius: 8, border: "none", background: "#1B6B47", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" },
    rejectBtn: { padding: "7px 14px", borderRadius: 8, border: "1px solid #FECDD3", background: "#fff", color: "#9B1C1C", fontWeight: 600, fontSize: 12, cursor: "pointer" },
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <div>
            <span style={S.tag}>CAMPUS PATENT UNIVERSIADE</span>
            <h1 style={S.h1}>캠퍼스 특허유니버시아드 일정관리</h1>
          </div>
          <div style={S.monthNav}>
            <button onClick={prevMonth} style={S.navBtn}>‹</button>
            <span style={S.monthLabel}>{year}년 {month + 1}월</span>
            <button onClick={nextMonth} style={S.navBtn}>›</button>
          </div>
        </div>
        <div style={S.tabs}>
          {[
            { id: "calendar", label: "📅 캘린더" },
            { id: "changes",  label: `✏️ 수정 내역${pendingCount ? ` (${pendingCount})` : ""}` },
            { id: "meeting",  label: "🤝 회의 일정" },
          ].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={S.tabBtn(tab === t.id)}>{t.label}</button>)}
        </div>
      </div>

      <div style={S.body}>

        {/* ── 캘린더 탭 ── */}
        {tab === "calendar" && (
          <div>
            <div style={S.memberRow}>
              <span style={{ fontSize: 12, color: "#999" }}>일정 입력:</span>
              {MEMBERS.map(m => (
                <button key={m.id} onClick={() => setActiveMember(m.id)} style={{
                  padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${m.border}`,
                  background: activeMember === m.id ? m.bg : "#fff", color: m.text,
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  boxShadow: activeMember === m.id ? `0 0 0 2px ${m.color}40` : "none",
                }}>{m.name}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#CCC" }}>날짜 클릭 → 일정 입력</span>
            </div>

            <div style={S.calGrid}>
              <div style={S.dayHeaders}>
                {DAYS_KO.map((d, i) => (
                  <div key={d} style={{ textAlign: "center", padding: "10px 0", fontSize: 12, fontWeight: 700, color: i === 0 ? "#CC2222" : i === 6 ? "#2255CC" : "#888", background: "#FAFAF8" }}>{d}</div>
                ))}
              </div>
              <div style={S.cells}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} style={{ minHeight: 90, borderRight: "1px solid #F0EBE5", borderBottom: "1px solid #F0EBE5", background: "#FAFAF8" }} />
                ))}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const d = i + 1;
                  const date = toKey(year, month, d);
                  const dow = new Date(year, month, d).getDay();
                  const isWE = dow === 0 || dow === 6;
                  const data = getCellData(date);
                  return (
                    <div key={d} onClick={() => openModal(date, activeMember)}
                      style={{ minHeight: 90, padding: "8px 6px 6px", cursor: "pointer", borderRight: "1px solid #F0EBE5", borderBottom: "1px solid #F0EBE5", background: isWE ? "#FAFAF8" : "#fff", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F4FBF7"}
                      onMouseLeave={e => e.currentTarget.style.background = isWE ? "#FAFAF8" : "#fff"}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: dow === 0 ? "#CC2222" : dow === 6 ? "#2255CC" : "#333" }}>{d}</div>
                      {data.meetings.map(mt => <div key={mt.id} style={S.meetChip}>🤝 {mt.title}</div>)}
                      {MEMBERS.map(m => {
                        const task = data.schedules[m.id];
                        return task ? <div key={m.id} style={S.chip(m)} title={`${m.name}: ${task}`}><b>{m.name[0]}</b> {task}</div> : null;
                      })}
                      {data.pending.length > 0 && <div style={{ fontSize: 10, color: "#C47B00", fontWeight: 600, marginTop: 2 }}>✏️ 수정 대기 {data.pending.length}건</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 수정 내역 탭 ── */}
        {tab === "changes" && (
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>기존 일정이 수정되면 즉시 반영되지 않고 아래에 기록됩니다. 확인 후 승인하면 캘린더에 반영돼요.</p>
            {changes.length === 0 && <div style={S.emptyState}>수정 요청이 없습니다.</div>}

            {changes.filter(c => c.status === "pending").length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={S.sectionTitle}>⏳ 승인 대기</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {changes.filter(c => c.status === "pending").map(ch => {
                    const m = mi(ch.member);
                    return (
                      <div key={ch.id} style={{ background: "#fff", border: "1.5px solid #F5D878", borderRadius: 12, padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <span style={{ background: m.bg, color: m.text, fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 20, border: `1px solid ${m.border}` }}>{m.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{ch.date}</span>
                          <span style={{ fontSize: 11, color: "#BBB", marginLeft: "auto" }}>{ch.timestamp}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 13 }}>
                          <div style={{ background: "#F5F5F5", borderRadius: 6, padding: "6px 12px", color: "#777", textDecoration: "line-through", flex: 1 }}>{ch.original}</div>
                          <span style={{ color: "#CCC", fontSize: 16 }}>→</span>
                          <div style={{ background: "#FFFBEA", borderRadius: 6, padding: "6px 12px", color: "#7A6000", fontWeight: 600, flex: 1, border: "1px solid #F5D878" }}>{ch.proposed}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => approveChange(ch.id)} style={S.approveBtn}>✓ 승인하여 캘린더에 반영</button>
                          <button onClick={() => rejectChange(ch.id)} style={S.rejectBtn}>✕ 거절</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {changes.filter(c => c.status !== "pending").length > 0 && (
              <div>
                <h3 style={S.sectionTitle}>📋 처리 완료</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {changes.filter(c => c.status !== "pending").map(ch => {
                    const m = mi(ch.member);
                    const approved = ch.status === "approved";
                    return (
                      <div key={ch.id} style={{ background: "#fff", border: `1px solid ${approved ? "#C2E8D4" : "#FECDD3"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: 0.8 }}>
                        <span style={{ background: m.bg, color: m.text, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>{m.name}</span>
                        <span style={{ fontSize: 12, color: "#888" }}>{ch.date}</span>
                        <span style={{ fontSize: 12, color: "#777", flex: 1 }}><span style={{ textDecoration: "line-through", color: "#BBB" }}>{ch.original}</span>{" → "}<span style={{ color: approved ? "#1B6B47" : "#999" }}>{ch.proposed}</span></span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: approved ? "#D4EDDA" : "#FECDD3", color: approved ? "#1B6B47" : "#9B1C1C" }}>{approved ? "승인됨" : "거절됨"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 회의 일정 탭 ── */}
        {tab === "meeting" && (
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>모든 팀원 일정이 비어 있는 평일을 표시합니다. 날짜를 선택해 회의 일정을 추가하세요.</p>

            {meetings.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={S.sectionTitle}>✅ 확정된 회의 일정</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {meetings.map(mt => (
                    <div key={mt.id} style={{ background: "#fff", border: "1px solid #C2E8D4", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1B6B47" }}>🤝</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{mt.date}</span>
                      <span style={{ fontSize: 13, color: "#555", flex: 1 }}>{mt.title}</span>
                      <button onClick={() => deleteMeeting(mt.id)} style={{ border: "none", background: "none", color: "#CCC", cursor: "pointer", fontSize: 18 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={S.sectionTitle}>📭 빈 날 (모든 팀원 일정 없음)</h3>
            {(() => {
              const free = getFreeDays();
              if (free.length === 0) return <div style={S.emptyState}>비어 있는 평일이 없습니다.</div>;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
                  {free.map(({ date, d, dow }) => {
                    const hasMtg = meetings.some(m => m.date === date);
                    return (
                      <button key={date} onClick={() => openMeetingModal(date)} style={{ background: hasMtg ? "#D4EDDA" : "#fff", border: `1.5px solid ${hasMtg ? "#9ADBBE" : "#E8E4DF"}`, borderRadius: 10, padding: "14px 12px", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1B6B47" }}>{d}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{month + 1}월 {DAYS_KO[dow]}요일</div>
                        {hasMtg && <div style={{ fontSize: 11, color: "#1B6B47", marginTop: 6, fontWeight: 600 }}>🤝 회의 예정</div>}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── 모달 ── */}
      {modal && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            {modal.type === "meeting" ? (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>회의 일정 추가</h2>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>{modal.date}</p>
                <input autoFocus value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submitMeeting()} placeholder="회의 제목" style={S.input} />
                <div style={S.btnRow}>
                  <button onClick={submitMeeting} style={S.primaryBtn()}>추가하기</button>
                  <button onClick={() => setModal(null)} style={S.secondaryBtn}>취소</button>
                </div>
              </>
            ) : (() => {
              const m = mi(modal.member);
              const existing = schedules[modal.date]?.[modal.member];
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ background: m.bg, color: m.text, fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20, border: `1px solid ${m.border}` }}>{m.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>{modal.date}</span>
                  </div>
                  {existing && (
                    <div style={{ background: "#F9F7F4", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#888", marginBottom: 14 }}>
                      <span style={{ fontWeight: 600 }}>현재 일정:</span> {existing}<br />
                      <span style={{ color: "#BBAA99", fontSize: 11 }}>내용이 다르면 수정 요청으로 기록됩니다</span>
                    </div>
                  )}
                  <input autoFocus value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submitSchedule()} placeholder={existing ? "수정할 일정 내용" : "일정 내용 입력"} style={S.input} />
                  <div style={S.btnRow}>
                    <button onClick={submitSchedule} style={S.primaryBtn(m.color)}>
                      {existing && inputVal.trim() !== existing ? "수정 요청" : "저장"}
                    </button>
                    {existing && <button onClick={() => deleteSchedule(modal.date, modal.member)} style={S.dangerBtn}>삭제</button>}
                    <button onClick={() => setModal(null)} style={S.secondaryBtn}>취소</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
