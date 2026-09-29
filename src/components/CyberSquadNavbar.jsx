import React, { useState } from "react";
import { sendIncidentAlert } from "../services/cometchat";

export function CyberSquadNavbar({ currentUser, onSwitchUser, activeTab, onTabChange }) {
  const [defcon, setDefcon] = useState(3);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [scenarioCounter, setScenarioCounter] = useState(0);

  const defconLabels = {
    5: "NORMAL",
    4: "GUARDED",
    3: "ELEVATED",
    2: "HIGH ALERT",
    1: "ACTIVE BREACH",
  };

  const cycleDefcon = () => {
    setDefcon((prev) => (prev === 1 ? 5 : prev - 1));
  };

  const handleBroadcastAlert = async () => {
    try {
      setIsBroadcasting(true);
      await sendIncidentAlert(scenarioCounter);
      setScenarioCounter((prev) => prev + 1);
      setToastMessage("🚨 Threat incident broadcasted to War Room!");
      onTabChange("groups");
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      console.error("Alert broadcast failed:", err);
      setToastMessage("Broadcast failed. Check console.");
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <>
      <header className="cybersquad-navbar">
        <div className="navbar-left">
          <div className="brand-logo-container">
            <div className="shield-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">CYBERSQUAD</span>
              <span className="brand-subtitle">INCIDENT RESPONSE & SEC-OPS HUB</span>
            </div>
          </div>

          <div className="system-status-pills">
            <span className="status-pill status-online">
              <span className="pulse-dot"></span>
              SYS: NOMINAL
            </span>

            {/* Interactive DEFCON Selector (Levels 5 -> 4 -> 3 -> 2 -> 1) */}
            <button
              className={`status-pill defcon-btn defcon-${defcon}`}
              onClick={cycleDefcon}
              title="Click to cycle DEFCON readiness levels (5 to 1)"
            >
              <span className={`defcon-dot defcon-dot-${defcon}`}></span>
              DEFCON {defcon} // {defconLabels[defcon]}
            </button>

            <span className="status-pill status-region">
              REGION: IN
            </span>
          </div>
        </div>

        <div className="navbar-center-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "chats" ? "active" : ""}`}
            onClick={() => onTabChange("chats")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Squad Chats
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => onTabChange("groups")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            War Rooms (Groups)
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => onTabChange("users")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Agent Roster
          </button>
        </div>

        <div className="navbar-right">
          {/* Threat Simulator 1-Click Broadcast Button */}
          {currentUser && (
            <button
              className={`simulate-threat-btn ${isBroadcasting ? "broadcasting" : ""}`}
              onClick={handleBroadcastAlert}
              disabled={isBroadcasting}
              title="Broadcast a live simulated incident alert into Incident Alpha War Room"
            >
              <span className="threat-icon">⚡</span>
              <span>{isBroadcasting ? "BROADCASTING..." : "SIMULATE BREACH ALERT"}</span>
            </button>
          )}

          {currentUser ? (
            <div className="user-profile-badge">
              <img
                src={currentUser.getAvatar?.() || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.getUid?.()}`}
                alt="Avatar"
                className="user-avatar"
              />
              <div className="user-info">
                <span className="user-name">{currentUser.getName?.() || currentUser.getUid?.()}</span>
                <span className="user-uid">UID: {currentUser.getUid?.()}</span>
              </div>
              <button
                className="switch-user-btn"
                onClick={onSwitchUser}
                title="Switch Agent / Logout"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Switch</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Floating Tactical Notification Toast */}
      {toastMessage && (
        <div className="tactical-toast">
          <span className="toast-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
