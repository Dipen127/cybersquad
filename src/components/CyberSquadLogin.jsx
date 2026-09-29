import React, { useState } from "react";
import { DEMO_AGENTS, ensureDevUser, ensureSquadChannels } from "../services/cometchat";

export function CyberSquadLogin({ onLoginSuccess }) {
  const [loadingUid, setLoadingUid] = useState(null);
  const [customUid, setCustomUid] = useState("");
  const [customName, setCustomName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (uid, name, avatar) => {
    try {
      setLoadingUid(uid);
      setErrorMessage("");
      const user = await ensureDevUser(uid, name, avatar);
      await ensureSquadChannels();
      onLoginSuccess(user);
    } catch (err) {
      console.error("Authentication failed:", err);
      setErrorMessage(
        err.message || "Failed to authenticate with CometChat. Please check your credentials in .env"
      );
    } finally {
      setLoadingUid(null);
    }
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!customUid.trim()) return;
    handleLogin(
      customUid.trim(),
      customName.trim() || `Agent ${customUid.trim()}`,
      `https://api.dicebear.com/7.x/bottts/svg?seed=${customUid.trim()}`
    );
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <div className="shield-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1>CYBERSQUAD COMMAND</h1>
          <p className="subtitle">SECURE INCIDENT RESPONSE & SOC COLLABORATION HUB</p>
          <div className="login-meta-badges">
            <span className="badge-tag green">● COMETCHAT v7 CONNECTED</span>
            <span className="badge-tag cyan">REGION: IN</span>
            <span className="badge-tag orange">DEFCON LEVEL 3</span>
          </div>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="agent-selection-section">
          <h3>⚡ SELECT OPERATIVE IDENTITY</h3>
          <p className="section-desc">Click any squad operative to authenticate and join active communications:</p>

          <div className="agent-grid">
            {DEMO_AGENTS.map((agent) => {
              const isLoading = loadingUid === agent.uid;
              return (
                <button
                  key={agent.uid}
                  className={`agent-card ${isLoading ? "loading" : ""}`}
                  onClick={() => handleLogin(agent.uid, agent.name, agent.avatar)}
                  disabled={!!loadingUid}
                >
                  <img src={agent.avatar} alt={agent.name} className="agent-avatar" />
                  <div className="agent-details">
                    <div className="agent-top">
                      <span className="agent-name">{agent.name}</span>
                      <span className="agent-badge">{agent.badge}</span>
                    </div>
                    <span className="agent-role">{agent.role}</span>
                    <span className="agent-callsign">CALLSIGN: {agent.callsign}</span>
                    <span className="agent-uid">UID: {agent.uid}</span>
                  </div>
                  <div className="card-action">
                    {isLoading ? (
                      <span className="spinner"></span>
                    ) : (
                      <span className="deploy-btn">DEPLOY →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="divider">
          <span>OR AUTHENTICATE CUSTOM OPERATIVE</span>
        </div>

        <form onSubmit={handleCustomLogin} className="custom-login-form">
          <div className="input-group">
            <label>Agent UID (e.g., cometchat-uid-4 or custom)</label>
            <input
              type="text"
              placeholder="Enter UID..."
              value={customUid}
              onChange={(e) => setCustomUid(e.target.value)}
              disabled={!!loadingUid}
            />
          </div>
          <div className="input-group">
            <label>Display Name (optional)</label>
            <input
              type="text"
              placeholder="Enter Name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={!!loadingUid}
            />
          </div>
          <button
            type="submit"
            className="custom-submit-btn"
            disabled={!customUid.trim() || !!loadingUid}
          >
            {loadingUid === customUid ? "CONNECTING..." : "ENTER COMMAND TERMINAL"}
          </button>
        </form>
      </div>
    </div>
  );
}
