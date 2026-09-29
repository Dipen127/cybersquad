import React, { useReducer, useEffect } from "react";
import {
  CometChatErrorBoundary,
  CometChatConversations,
  CometChatUsers,
  CometChatGroups,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageComposer,
  CometChatThreadHeader,
  CometChatSearch,
  CometChatGroupMembers,
  CometChatIncomingCall,
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useIsMobile } from "../hooks/useIsMobile";

function reducer(state, action) {
  switch (action.type) {
    case "tab":
      return { ...state, tab: action.value };
    case "user":
      return {
        ...state,
        user: action.value,
        group: undefined,
        conversation: action.conv,
        side: "none",
        thread: undefined,
      };
    case "group":
      return {
        ...state,
        group: action.value,
        user: undefined,
        conversation: action.conv,
        side: "none",
        thread: undefined,
      };
    case "thread":
      return { ...state, thread: action.value, side: "thread" };
    case "side":
      return { ...state, side: action.value };
    case "clearChat":
      return { ...state, user: undefined, group: undefined, conversation: undefined, side: "none", thread: undefined };
    default:
      return state;
  }
}

export function CyberSquadChat({ activeTab, onTabChange }) {
  const isMobile = useIsMobile();
  const [state, dispatch] = useReducer(reducer, {
    tab: activeTab || "chats",
    side: "none",
    user: undefined,
    group: undefined,
    conversation: undefined,
    thread: undefined,
  });

  useEffect(() => {
    if (activeTab && activeTab !== state.tab) {
      dispatch({ type: "tab", value: activeTab });
    }
  }, [activeTab]);

  const target = state.user
    ? { user: state.user }
    : state.group
    ? { group: state.group }
    : undefined;
  const hasChat = !!target;

  // Selector column (Chats / Users / Groups or Global Search)
  const selectorColumn = (
    <aside className="list-column">
      {state.side === "search" ? (
        <CometChatSearch
          onBack={() => dispatch({ type: "side", value: "none" })}
          onConversationClicked={(e) => {
            const w = e.conversation.getConversationWith();
            if (w instanceof CometChat.User) {
              dispatch({ type: "user", value: w, conv: e.conversation });
            } else if (w instanceof CometChat.Group) {
              dispatch({ type: "group", value: w, conv: e.conversation });
            }
          }}
          onMessageClicked={() => {}}
        />
      ) : (
        <>
          <div className="selector-header">
            <span className="channel-section-title">
              {state.tab === "chats" && "DIRECT & INCIDENT CHANNELS"}
              {state.tab === "groups" && "ACTIVE WAR ROOMS (GROUPS)"}
              {state.tab === "users" && "DEPLOYED AGENTS"}
            </span>
          </div>

          <div className="selector-content">
            {state.tab === "chats" && (
              <CometChatConversations
                activeConversation={state.conversation}
                onItemClick={(c) => {
                  const e = c.getConversationWith();
                  if (e instanceof CometChat.User) {
                    dispatch({ type: "user", value: e, conv: c });
                  } else if (e instanceof CometChat.Group) {
                    dispatch({ type: "group", value: e, conv: c });
                  }
                }}
                onSearchBarClicked={() => dispatch({ type: "side", value: "search" })}
              />
            )}

            {state.tab === "groups" && (
              <CometChatGroups
                activeGroup={state.group}
                onItemClick={(g) => dispatch({ type: "group", value: g })}
              />
            )}

            {state.tab === "users" && (
              <CometChatUsers
                activeUser={state.user}
                onItemClick={(u) => dispatch({ type: "user", value: u })}
              />
            )}
          </div>
        </>
      )}
    </aside>
  );

  // Message Pane (Header + Message List + Composer)
  const messagePane = hasChat ? (
    <main className="message-pane">
      <CometChatMessageHeader
        {...target}
        hideBackButton={!isMobile}
        onBack={() => dispatch({ type: "clearChat" })}
        onItemClick={() => dispatch({ type: "side", value: "details" })}
        showSearchOption
        onSearchOptionClicked={() => dispatch({ type: "side", value: "chat-search" })}
      />
      <CometChatMessageList
        {...target}
        onThreadRepliesClick={(m) => dispatch({ type: "thread", value: m })}
      />
      <CometChatMessageComposer {...target} />
    </main>
  ) : (
    <main className="message-pane empty-pane">
      <div className="tactical-empty-state">
        <div className="radar-animation">
          <div className="radar-sweep"></div>
          <div className="radar-circle circle-1"></div>
          <div className="radar-circle circle-2"></div>
          <div className="radar-circle circle-3"></div>
          <div className="radar-crosshair-h"></div>
          <div className="radar-crosshair-v"></div>
          <div className="radar-blip blip-1"></div>
          <div className="radar-blip blip-2"></div>
        </div>
        <h2>CYBERSQUAD TRANSMISSION HUB</h2>
        <p>No active feed connected. Select a squad operative or war room from the left to engage secure telemetry.</p>
        <div className="quick-actions-bar">
          <button className="quick-action-tag" onClick={() => onTabChange("groups")}>
            🚨 Jump to War Rooms
          </button>
          <button className="quick-action-tag" onClick={() => onTabChange("users")}>
            👤 View Active Agents
          </button>
        </div>
      </div>
    </main>
  );

  // Side Panel (Threads, In-chat search, Group members)
  const sidePanel = hasChat && state.side !== "none" && state.side !== "search" && (
    <aside className="side-column">
      {state.side === "thread" && state.thread && (
        <div className="thread-wrapper" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <CometChatThreadHeader
            parentMessage={state.thread}
            onClose={() => dispatch({ type: "side", value: "none" })}
          />
          <CometChatMessageList {...target} parentMessageId={state.thread.getId()} />
          <CometChatMessageComposer {...target} parentMessageId={state.thread.getId()} />
        </div>
      )}

      {state.side === "chat-search" && (
        <CometChatSearch
          uid={state.user?.getUid()}
          guid={state.group?.getGuid()}
          searchIn={["messages"]}
          onBack={() => dispatch({ type: "side", value: "none" })}
          onMessageClicked={() => {}}
        />
      )}

      {state.side === "details" && state.group && (
        <div className="group-members-wrapper" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="side-header-bar">
            <button
              className="side-back-btn"
              aria-label="Back"
              onClick={() => dispatch({ type: "side", value: "none" })}
            >
              ← Back
            </button>
            <h4>War Room Personnel</h4>
          </div>
          <div style={{ flex: "1 1 0", minHeight: 0 }}>
            <CometChatGroupMembers
              group={state.group}
              onBack={() => dispatch({ type: "side", value: "none" })}
            />
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <CometChatErrorBoundary>
      <div className="cc-app">
        {(!isMobile || !hasChat) && selectorColumn}
        {(!isMobile || hasChat) && (isMobile && state.side !== "none" ? sidePanel : messagePane)}
        {!isMobile && sidePanel}
        <CometChatIncomingCall />
      </div>
    </CometChatErrorBoundary>
  );
}
