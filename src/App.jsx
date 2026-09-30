import React, { useState, useEffect } from "react";
import { CometChatProvider, CometChatUIKit } from "@cometchat/chat-uikit-react";
import "@cometchat/chat-uikit-react/styles";
import { initCometChat, logoutUser, cleanupSampleGroups } from "./services/cometchat";
import { CyberSquadNavbar } from "./components/CyberSquadNavbar";
import { CyberSquadLogin } from "./components/CyberSquadLogin";
import { CyberSquadChat } from "./components/CyberSquadChat";
import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [incidentTrigger, setIncidentTrigger] = useState(0);

  const handleIncidentAlertSent = () => {
    setActiveTab("groups");
    setIncidentTrigger(Date.now());
  };

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        await initCometChat();
        const user = CometChatUIKit.getLoggedInUser();
        if (user) {
          cleanupSampleGroups();
        }
        if (isMounted) {
          setCurrentUser(user);
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if (isMounted) {
          setInitError(err.message || "Failed to initialize CometChat");
          setIsInitializing(false);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleSwitchUser = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  if (isInitializing) {
    return (
      <div className="system-loading-screen">
        <div className="terminal-loader">
          <div className="shield-pulse"></div>
          <h2>INITIALIZING CYBERSQUAD DEFENSE GRID...</h2>
          <p>Connecting to CometChat Real-Time Communications Gateway</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="system-loading-screen">
        <div className="error-card">
          <h2>⚠️ INITIALIZATION ERROR</h2>
          <p>{initError}</p>
          <p className="hint">
            Please verify that your <code>.env</code> file has valid <code>VITE_COMETCHAT_APP_ID</code>, <code>VITE_COMETCHAT_REGION</code>, and <code>VITE_COMETCHAT_AUTH_KEY</code>.
          </p>
          <button onClick={() => window.location.reload()} className="reload-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cybersquad-root">
      <CyberSquadNavbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onIncidentAlertSent={handleIncidentAlertSent}
      />

      <div className="cybersquad-main-container">
        {currentUser ? (
          <CometChatProvider theme="dark">
            <CyberSquadChat
              activeTab={activeTab}
              onTabChange={setActiveTab}
              incidentTrigger={incidentTrigger}
            />
          </CometChatProvider>
        ) : (
          <CyberSquadLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
}
