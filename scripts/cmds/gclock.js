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
    if (args.length === 0) {
      return message.reply("⚠️ Please provide a group name to lock");
    }

    const newName = args.join(" ");

    // Save locked name in thread settings
    await threadsData.set(event.threadID, { lockedName: newName }, "settings");

    // Try to set group name
    try {
      await api.setTitle(newName, event.threadID);
    } catch (err) {
      return message.reply("❌ Failed to change group name (bot might not be admin)");
    }

    return message.reply(`✅ Group name locked as: ${newName}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedName = settings.lockedName;
    if (!lockedName) return;

    if (event.logMessageData && event.logMessageData.name !== lockedName) {
      try {
        await api.setTitle(lockedName, event.threadID);
      } catch (err) {
        // ignore silently
      }
    }
  }
};
