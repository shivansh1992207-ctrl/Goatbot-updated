module.exports = {
  config: {
    name: "gclock",
    version: "1.2",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock the group name silently",
    category: "box chat",
    guide: "{pn} <name>"
  },

  onStart: async function({ message, event, args, threadsData, api }) {
    if (!args[0]) return; 
    const newName = args.join(" ");

    // Save locked name silently
    await threadsData.set(event.threadID, { lockedName: newName }, "settings");

    // Try initial set (fail silently if no admin)
    try { await api.setTitle(newName, event.threadID); } catch(e) {}
  },

  onEvent: async function({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedName = settings.lockedName;
    if (!lockedName) return;

    // Revert silently if name changed
    if (event.logMessageData && event.logMessageData.name !== lockedName) {
      try { await api.setTitle(lockedName, event.threadID); } catch(e) {}
    }
  }
};
