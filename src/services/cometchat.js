import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";

const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
const REGION = import.meta.env.VITE_COMETCHAT_REGION;
const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

export const DEMO_AGENTS = [
  {
    uid: "cometchat-uid-1",
    name: "Alex Mercer",
    role: "Squad Commander",
    callsign: "VIPER-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    badge: "SOC LEAD",
  },
  {
    uid: "cometchat-uid-2",
    name: "Samira Chen",
    role: "Threat Intel Analyst",
    callsign: "GHOST-02",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    badge: "INTEL OPS",
  },
  {
    uid: "cometchat-uid-3",
    name: "Elena Rostova",
    role: "Incident Responder",
    callsign: "AEGIS-03",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
    badge: "SEC OPS",
  },
];

export const THREAT_SCENARIOS = [
  {
    title: "Unauthorized Privilege Escalation (CVE-2024-38077)",
    target: "prod-k8s-worker-03 (10.0.4.18)",
    severity: "CRITICAL (CVSS 9.8)",
    ioc: "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    title: "Ransomware Data Exfiltration Beaconing",
    target: "central-sql-database-primary (10.0.12.50)",
    severity: "HIGH (CVSS 8.5)",
    ioc: "C2 IP: 185.220.101.44:443 (Known Threat Node)",
  },
  {
    title: "Volumetric SYN Flood & API Gateway Saturation",
    target: "auth-gateway-edge.cybersquad.internal",
    severity: "HIGH (CVSS 8.1)",
    ioc: "Traffic Peak: 480 Gbps / Botnet Variant",
  },
];

export async function sendIncidentAlert(scenarioIndex = 0) {
  const scenario = THREAT_SCENARIOS[scenarioIndex % THREAT_SCENARIOS.length];
  const alertText = `🚨 [CRITICAL INCIDENT ALERT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE: ${scenario.title}
TARGET: ${scenario.target}
SEVERITY: ${scenario.severity}
IOC: ${scenario.ioc}
TIMESTAMP: ${new Date().toLocaleTimeString()}
ACTION REQUIRED: All available operatives coordinate containment steps in this thread.`;

  const textMessage = new CometChat.TextMessage(
    "incident-alpha",
    alertText,
    CometChat.RECEIVER_TYPE.GROUP
  );
  return await CometChat.sendMessage(textMessage);
}

let initPromise = null;

export function initCometChat() {
  if (!APP_ID || !REGION || !AUTH_KEY) {
    return Promise.reject(
      new Error("CometChat credentials missing in .env (Check VITE_COMETCHAT_APP_ID, REGION, and AUTH_KEY)")
    );
  }

  if (!initPromise) {
    initPromise = CometChatUIKit.initFromSettings({
      appId: APP_ID,
      region: REGION,
      credentials: { authKey: AUTH_KEY },
      chatSDK: { presenceSubscription: { type: "ALL_USERS" } },
    });
  }
  return initPromise;
}

let loginInFlight = null;

export async function ensureLoggedIn(uid) {
  const existing = CometChatUIKit.getLoggedInUser();
  if (existing && existing.getUid?.() === uid) return existing;
  if (existing) {
    try {
      await CometChatUIKit.logout();
    } catch (e) {
      console.warn("Logout error ignored:", e);
    }
  }

  if (loginInFlight) {
    await loginInFlight;
    return CometChatUIKit.getLoggedInUser();
  }

  loginInFlight = CometChatUIKit.login(uid);
  try {
    const user = await loginInFlight;
    return user;
  } finally {
    loginInFlight = null;
  }
}

export async function cleanupSampleGroups() {
  try {
    const groupsRequest = new CometChat.GroupsRequestBuilder().setLimit(30).build();
    const groups = await groupsRequest.fetchNext();
    for (const g of groups) {
      const name = g.getName()?.toLowerCase() || "";
      if (name.includes("hiking") || name.includes("comic") || name.includes("food")) {
        try {
          await CometChat.deleteGroup(g.getGuid());
          console.log(`Deleted sample group: ${g.getName()}`);
        } catch {
          try {
            await CometChat.leaveGroup(g.getGuid());
          } catch {
            // ignore
          }
        }
      }
    }
  } catch (err) {
    console.debug("Cleanup sample groups error:", err);
  }
}

export async function ensureDevUser(uid, name, avatar) {
  await initCometChat();
  try {
    const u = new CometChat.User(uid);
    if (name) u.setName(name);
    if (avatar) u.setAvatar(avatar);
    await CometChatUIKit.createUser(u);
  } catch {
    // If user already exists in CometChat dashboard, update their name & avatar to match CyberSquad
    try {
      const u = new CometChat.User(uid);
      if (name) u.setName(name);
      if (avatar) u.setAvatar(avatar);
      await CometChat.updateUser(u, AUTH_KEY);
    } catch (updateErr) {
      console.debug("Update user error:", updateErr);
    }
  }
  return await ensureLoggedIn(uid);
}

export async function ensureSquadChannels() {
  await cleanupSampleGroups();
  const defaultGroups = [
    { guid: "incident-alpha", name: "🚨 Incident Alpha Response", type: CometChat.GROUP_TYPE.PUBLIC },
    { guid: "threat-intel", name: "🛡️ Threat Intel & IOCs", type: CometChat.GROUP_TYPE.PUBLIC },
    { guid: "cybersquad-hq", name: "⚡ CyberSquad Operations HQ", type: CometChat.GROUP_TYPE.PUBLIC },
  ];

  for (const g of defaultGroups) {
    try {
      const group = new CometChat.Group(g.guid, g.name, g.type);
      await CometChat.createGroup(group);
    } catch {
      // Group already exists, attempt to join
      try {
        await CometChat.joinGroup(g.guid, g.type);
      } catch {
        // Already joined
      }
    }
  }
}

export async function logoutUser() {
  try {
    await CometChatUIKit.logout();
  } catch (e) {
    console.error("Logout failed:", e);
  }
}

export function getCurrentUser() {
  return CometChatUIKit.getLoggedInUser();
}
