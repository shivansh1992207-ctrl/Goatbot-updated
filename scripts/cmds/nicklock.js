module.exports = {
  config: {
    name: "nicklock",
    version: "1.4",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock or unlock nicknames of all group members (auto-revert if changed)",
    category: "box chat",
    guide: "{pn} <nickname> | {pn} off"
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const settings = await threadsData.get(event.threadID, "settings") || {};

    if (!args[0]) return message.reply("⚠️ Please provide a nickname to lock, or 'off' to disable nicklock");

    if (args[0].toLowerCase() === "off") {
      await threadsData.set(event.threadID, { lockedNick: null }, "settings");
      return message.reply("✅ NickLock has been turned OFF for this group");
    }

    const lockedNick = args.join(" ");
    await threadsData.set(event.threadID, { lockedNick }, "settings");

    return message.reply(`✅ All member nicknames locked as: ${lockedNick}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:user-nickname") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedNick = settings.lockedNick;
    if (!lockedNick) return; // Nicklock OFF

    const uid = event.logMessageData.userID;
    if (uid === api.getCurrentUserID()) return; // Skip bot itself

    // Revert nickname immediately if changed
    if (event.logMessageData.nickname !== lockedNick) {
      try {
        await api.changeNickname(lockedNick, event.threadID, uid);
      } catch (err) {
        // ignore silently
      }
    }
  }
};
