module.exports = {
  config: {
    name: "nicklock",
    version: "1.2",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock or unlock nicknames of all group members (works without admin)",
    category: "box chat",
    guide: "{pn} <nickname> | {pn} off"
  },

  onStart: async function ({ message, event, args, threadsData, api }) {
    const settings = await threadsData.get(event.threadID, "settings") || {};

    if (!args[0]) return message.reply("⚠️ Please provide a nickname to lock, or 'off' to disable nicklock");

    if (args[0].toLowerCase() === "off") {
      await threadsData.set(event.threadID, { lockedNick: null }, "settings");
      return message.reply("✅ NickLock has been turned OFF for this group");
    }

    const lockedNick = args.join(" ");
    await threadsData.set(event.threadID, { lockedNick }, "settings");

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      for (const mem of threadInfo.participantIDs) {
        if (mem !== api.getCurrentUserID()) {
          // Bina admin check ke directly nickname change kar do
          api.changeNickname(lockedNick, event.threadID, mem).catch(e => {});
        }
      }
    } catch (err) {
      // ignore silently
    }

    return message.reply(`✅ All member nicknames locked as: ${lockedNick}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:user-nickname") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedNick = settings.lockedNick;
    if (!lockedNick) return;

    const uid = event.logMessageData.userID;
    if (uid === api.getCurrentUserID()) return;

    // Bina admin ke bhi forcefully nickname revert karo
    if (event.logMessageData.nickname !== lockedNick) {
      try {
        api.changeNickname(lockedNick, event.threadID, uid).catch(e => {});
      } catch {}
    }
  }
};
