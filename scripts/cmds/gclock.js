module.exports = {
  config: {
    name: "gclock",
    version: "1.0",
    author: "Anurag Mishra",
    countDown: 5,
    role: 1,
    description: "Lock group name to a fixed name",
    category: "box chat",
    guide: "{pn} <name>: lock group name to <name>"
  },

  onStart: async function ({ message, event, args, threadsData, api }) {
    if (!args[0]) return message.reply("⚠️ Please provide a group name to lock");

    const newName = args.join(" ");
    try {
      await api.setTitle(newName, event.threadID);
    } catch (e) {
      return message.reply("❌ Failed to change group name (bot might not be admin)");
    }

    // Save group lock into thread data
    await threadsData.set(event.threadID, newName, "groupNameLock");

    return message.reply(`✅ Group name locked to: ${newName}`);
  },

  onEvent: async function ({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;
    const lockedName = await threadsData.get(event.threadID, "groupNameLock");
    if (!lockedName) return;

    if (event.logMessageData && event.logMessageData.name !== lockedName) {
      try {
        await api.setTitle(lockedName, event.threadID);
      } catch (e) {
        // ignore error
      }
    }
  }
};
