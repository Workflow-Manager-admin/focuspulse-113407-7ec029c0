import React, { useEffect, useState, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * FocusPulse Main Container Component
 * A Pomodoro Timer app with Supabase Auth, session logging, and responsive UI
 */

// Supabase client import and initialization
// PUBLIC_INTERFACE
import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your Supabase project details or load via environment variables
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Color Scheme
const COLORS = {
  primary: "#4CAF50",
  secondary: "#FFC107",
  accent: "#2196F3",
  light: "#ffffff",
  darktext: "#232323"
};

// Pomodoro Settings (in seconds)
const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

// Helper: Format seconds as MM:SS
function formatSeconds(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Login/Register Form
function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Email and password required.");
      return;
    }
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }
      if (result.error) {
        setErrorMsg(result.error.message);
        return;
      }
      if (result.data?.user || result.user) {
        onAuth();
      } else {
        setErrorMsg(isLogin 
          ? "Login failed."
          : "Registration successful, check your email for confirmation link."
        );
      }
    } catch (err) {
      setErrorMsg("Authentication error.");
    }
  }
  return (
    <div style={{
      background: "#fff",
      color: COLORS.primary,
      boxShadow: "0 2px 8px rgba(60,60,85,0.1)",
      borderRadius: 10,
      padding: "2.5rem 2rem",
      maxWidth: 350,
      margin: "70px auto 0 auto"
    }}>
      <h2 style={{textAlign: "center", color: COLORS.primary, marginBottom: 20}}>
        {isLogin ? "Sign In" : "Register"}
      </h2>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: 18}}>
        <input
          style={{padding: 10, border: "1px solid #eee", borderRadius: 5}}
          placeholder="Email"
          type="email"
          value={email}
          autoComplete="username"
          autoFocus
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          style={{padding: 10, border: "1px solid #eee", borderRadius: 5}}
          placeholder="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={e=>setPassword(e.target.value)}
        />
        {errorMsg && <div style={{color: "#d32f2f", textAlign: "center"}}>{errorMsg}</div>}
        <button
          className="btn"
          style={{
            background: COLORS.primary,
            color: "#fff",
            fontWeight: 600,
            padding: "10px 0",
            border: "none",
            borderRadius: 4
          }}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <div style={{textAlign: "center", marginTop: 14}}>
        <button
          style={{
            background: "none",
            color: COLORS.accent,
            cursor: "pointer",
            border: "none",
            textDecoration: "underline",
            fontSize: 14
          }}
          onClick={()=>setIsLogin(!isLogin)}>
          {isLogin 
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

// Pomodoro Timer + Controls
function PomodoroTimer({ user, onSessionComplete }) {
  // Timer state
  const [isFocus, setIsFocus] = useState(true); // Focus or Break
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const intervalRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [prevSession, setPrevSession] = useState(null);

  // Start/Stop timer
  // PUBLIC_INTERFACE
  function startTimer() {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(()=>{
      setSecondsLeft(s=>s-1);
    }, 1000);
  }
  // PUBLIC_INTERFACE
  function pauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }
  // PUBLIC_INTERFACE
  function resetTimer() {
    pauseTimer();
    setSecondsLeft(isFocus ? FOCUS_DURATION : BREAK_DURATION);
  }
  // Handle timer finish
  useEffect(()=>{
    if (secondsLeft === 0 && running) {
      pauseTimer();
      const finishedType = isFocus ? "focus" : "break";
      if (isFocus) {
        onSessionComplete(FOCUS_DURATION); // log focus session
      }
      setPrevSession(finishedType);
      setShowModal(true);
      setTimeout(()=>setShowModal(false), 1700);
      setTimeout(()=>{
        setIsFocus(f=>!f);
        setSecondsLeft(isFocus ? BREAK_DURATION : FOCUS_DURATION);
      }, 1800);
    }
    // eslint-disable-next-line
  }, [secondsLeft, running, isFocus]);

  // Cleanup
  useEffect(()=>()=>pauseTimer(), []);
  
  return (
    <div
      style={{
        background: COLORS.light,
        color: COLORS.primary,
        borderRadius: 20,
        padding: "2.5rem 2rem",
        boxShadow: "0 2px 8px 0 rgba(33,33,80,0.08)",
        minWidth: 250,
        minHeight: 310,
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "12px 0"
      }}>
      <div style={{fontWeight: 600, fontSize: "1.2rem", letterSpacing: 1, marginBottom: 8}}>
        {isFocus ? "Focus" : "Break"}
      </div>
      <div style={{
        fontSize: "4.3rem",
        fontWeight: "bold",
        color: isFocus ? COLORS.primary : COLORS.accent,
        margin: "12px 0"
      }}>
        {formatSeconds(secondsLeft)}
      </div>
      <div style={{display: "flex", gap: 16, marginTop: 10}}>
        <button
          className="btn"
          style={{
            background: running ? COLORS.secondary : COLORS.primary,
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem"
          }}
          onClick={running ? pauseTimer : startTimer}>
          {running ? "Pause" : "Start"}
        </button>
        <button
          className="btn"
          style={{
            background: COLORS.accent,
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem"
          }}
          onClick={resetTimer}>
          Reset
        </button>
      </div>
      {showModal && (
        <div style={{
          marginTop: 18,
          fontWeight: 500,
          color: COLORS.accent,
          fontSize: 22
        }}>
          {prevSession === "focus" ? "Focus Complete! Break time!" : "Break over! Back to focus!"}
        </div>
      )}
    </div>
  );
}


// User's Focus Session History
function SessionHistory({ user }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    // PUBLIC_INTERFACE
    async function fetchSessions() {
      setLoading(true);
      let { data, error } = await supabase
        .from("focus_sessions")
        .select("id,created_at,duration")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);
      if (!error && data) setSessions(data);
      setLoading(false);
    }
    if (user && user.id) fetchSessions();
  }, [user]);
  // For adding a new session (callback, for parent to trigger)
  // PUBLIC_INTERFACE
  SessionHistory.refresh = async function(user, setSessions, setLoading) {
    setLoading(true);
    let { data, error } = await supabase
      .from("focus_sessions")
      .select("id,created_at,duration")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    if (!error && data) setSessions(data);
    setLoading(false);
  }
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "1.3rem 1.13rem",
        margin: "22px 0 0 0",
        boxShadow: "0 2px 8px rgba(40,40,85,0.07)",
        minHeight: 110,
      }}>
      <h4 style={{color: COLORS.primary, margin: "0 0 10px 0"}}>
        Session History
      </h4>
      {loading && <div style={{color: COLORS.accent}}>Loading...</div>}
      {!loading && sessions.length === 0 && (
        <div style={{color: COLORS.secondary}}>No sessions yet!</div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions.map(s=>(
          <li key={s.id} style={{
            borderBottom: "1px solid #f1f1f1", paddingBottom: 4, marginBottom: 7, fontSize: 15
          }}>
            <span style={{color: COLORS.primary, fontWeight: 500}}>
              {formatSeconds(s.duration)}
            </span>
            <span style={{marginLeft: 10, color: "#222"}}>
              {new Date(s.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// FocusPulse Main Container
// PUBLIC_INTERFACE
export default function FocusPulseMain() {
  // User state
  const [user, setUser] = useState(null);
  // For forcing SessionHistory refresh
  const [reloadKey, setReloadKey] = useState(0);

  // Try autologin
  useEffect(()=>{
    const getUser = async () => {
      const {data} = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") setUser(session.user);
      if (event === "SIGNED_OUT") setUser(null);
    });
    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  // PUBLIC_INTERFACE
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // PUBLIC_INTERFACE
  async function handleSessionComplete(duration) {
    // Log current session to Supabase
    if (!user) return;
    await supabase
      .from("focus_sessions")
      .insert([{ user_id: user.id, duration, created_at: new Date().toISOString() }]);
    // Refresh history
    setReloadKey(v=>v+1);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background:
        "linear-gradient(to bottom, #f8f8ff 50%, #e8ecf6 100%)",
      color: COLORS.darktext
    }}>
      {/* Header */}
      <nav
        style={{
          background: COLORS.primary,
          color: "#fff",
          padding: "16px 0",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 6px 0 rgba(60,60,90,0.08)"
        }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <span style={{
            fontWeight: 700,
            fontSize: "1.28rem",
            letterSpacing: "0.7px",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{
              color: COLORS.secondary,
              fontSize: 25,
              fontWeight: 700,
              marginRight: 7
            }}>⏱️</span>
            FocusPulse
          </span>
          {user && (
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                background: "#fff",
                color: COLORS.primary,
                border: "none",
                fontWeight: 600
              }}>
              Logout
            </button>
          )}
        </div>
      </nav>
      <main className="container" style={{
        maxWidth: 660,
        margin: "0 auto",
        padding: "0 16px",
        paddingTop: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "82vh"
      }}>
        {/* Authentication  */}
        {!user ? (
          <AuthForm onAuth={()=>{
            // after login, setUser runs via onAuthStateChange
          }} />
        ) : (
          <>
            {/* Welcome */}
            <div
              style={{
                textAlign: "center",
                marginTop: 18,
                marginBottom: 10,
                fontSize: 19,
                color: COLORS.primary,
                fontWeight: 600
              }}>
              Welcome, {user.email}!
            </div>
            {/* Pomodoro Timer */}
            <PomodoroTimer user={user} onSessionComplete={handleSessionComplete} />
            {/* Session History */}
            <div style={{width: "100%"}}>
              <SessionHistory user={user} key={reloadKey} />
            </div>
            <div style={{textAlign: "center", marginTop: 35, color: COLORS.secondary, fontSize: 15}}>
              <span>Powered by React & Supabase.</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
