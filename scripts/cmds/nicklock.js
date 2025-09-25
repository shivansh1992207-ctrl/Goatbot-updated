module.exports = {
  config: {
    name: "nicklock",
    version: "1.1",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock or unlock nicknames of all group members",
    category: "box chat",
    guide: "{pn} <nickname> | {pn} off"
  },

  onStart: async function ({ message, event, args, threadsData, api }) {
    const settings = await threadsData.get(event.threadID, "settings") || {};

    if (!args[0]) return message.reply("⚠️ Please provide a nickname to lock, or 'off' to disable nicklock");

    if (args[0].toLowerCase() === "off") {
      // Turn off nicklock
      await threadsData.set(event.threadID, { lockedNick: null }, "settings");
      return message.reply("✅ NickLock has been turned OFF for this group");
    }

    const lockedNick = args.join(" ");

    // Save locked nickname in thread settings
    await threadsData.set(event.threadID, { lockedNick }, "settings");

    // Change nicknames of all members immediately
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      for (const mem of threadInfo.participantIDs) {
        if (mem !== api.getCurrentUserID()) {
          await api.changeNickname(lockedNick, event.threadID, mem);
        }
      }
    } catch (err) {
      return message.reply("❌ Failed to change nicknames (bot might not be admin)");
    }

    return message.reply(`✅ All member nicknames locked as: ${lockedNick}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:user-nickname") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedNick = settings.lockedNick;
    if (!lockedNick) return; // nicklock OFF

    const uid = event.logMessageData.userID;
    if (uid === api.getCurrentUserID()) return; // skip bot itself

    if (event.logMessageData.nickname !== lockedNick) {
      try {
        await api.changeNickname(lockedNick, event.threadID, uid);
      } catch (err) {
        // ignore silently
      }
    }
  }
};
