module.exports = {
  config: {
    name: "gclock",
    version: "1.1",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock the group name to a fixed one",
    category: "box chat",
    guide: "{pn} <name>"
  },

  onStart: async function ({ message, event, args, threadsData, api }) {
    if (!args[0]) return message.reply("⚠️ Please provide a group name to lock");

    const newName = args.join(" ");

    // Save group name lock in database
    await threadsData.set(event.threadID, { lockedName: newName }, "settings");

    // Try to set group name once
    try {
      await api.setTitle(newName, event.threadID);
    } catch (e) {
      return message.reply("❌ Couldn't change group name (bot might not be admin)");
    }

    return message.reply(`✅ Group name locked as: ${newName}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;

    // Get lock name from DB
    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedName = settings.lockedName;
    if (!lockedName) return;

    // If group name changed and not equal to locked name → reset
    if (event.logMessageData?.name !== lockedName) {
      try {
        await api.setTitle(lockedName, event.threadID);
      } catch (e) {
        // ignore errors silently
      }
    }
  }
};
