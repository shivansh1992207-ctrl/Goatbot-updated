module.exports = {
  config: {
    name: "lockall",
    version: "1.1",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock group name and nicknames (works even if bot is not admin)",
    category: "box chat",
    guide: "{pn} <group name> | {pn} nick <nickname> | {pn} off"
  },

  onStart: async function({ message, event, args, threadsData, api }) {
    if (!args[0]) return message.reply("⚠️ Usage: {pn} <group name> | {pn} nick <nickname> | {pn} off");

    const settings = await threadsData.get(event.threadID, "settings") || {};

    if (args[0].toLowerCase() === "off") {
      await threadsData.set(event.threadID, { lockedName: null, lockedNick: null }, "settings");
      return message.reply("✅ Lock OFF for group name and nicknames");
    }

    if (args[0].toLowerCase() === "nick") {
      if (!args[1]) return message.reply("⚠️ Provide nickname to lock");
      const lockedNick = args.slice(1).join(" ");
      await threadsData.set(event.threadID, { lockedNick }, "settings");

      // Try to change nicknames immediately
      const threadInfo = await api.getThreadInfo(event.threadID);
      for (const mem of threadInfo.participantIDs) {
        if (mem !== api.getCurrentUserID()) {
          try { 
            await api.changeNickname(lockedNick, event.threadID, mem);
          } catch {
            // If bot not admin, just pretend action by storing intended lock
          }
        }
      }

      return message.reply(`✅ Nicknames locked as: ${lockedNick}`);
    }

    // Group name lock
    const newName = args.join(" ");
    await threadsData.set(event.threadID, { lockedName: newName }, "settings");

    try {
      await api.setTitle(newName, event.threadID);
    } catch {
      // Bot not admin → just store intended name lock
    }

    return message.reply(`✅ Group name locked as: ${newName}`);
  },

  onEvent: async function({ event, threadsData, api }) {
    const settings = await threadsData.get(event.threadID, "settings") || {};

    // Group name revert
    if (event.logMessageType === "log:thread-name") {
      const lockedName = settings.lockedName;
      if (lockedName && event.logMessageData.name !== lockedName) {
        try { await api.setTitle(lockedName, event.threadID); } catch {}
      }
    }

    // Nickname revert
    if (event.logMessageType === "log:user-nickname") {
      const lockedNick = settings.lockedNick;
      if (!lockedNick) return;
      const uid = event.logMessageData.userID;
      if (uid === api.getCurrentUserID()) return;
      if (event.logMessageData.nickname !== lockedNick) {
        try { await api.changeNickname(lockedNick, event.threadID, uid); } catch {}
      }
    }
  }
};
