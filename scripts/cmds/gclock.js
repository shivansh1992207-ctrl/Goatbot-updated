module.exports = {
  config: {
    name: "gclock",
    version: "1.3",
    author: "Anurag Mishra",
    role: 1,
    description: "Stable silent group lock (works even if bot is not admin)",
    category: "box chat",
    guide: "{pn} <name> | {pn} off"
  },

  onStart: async function({ message, event, args, threadsData, api }) {
    if (!args[0]) return; // do nothing if no args

    const text = args.join(" ");
    if (text.toLowerCase() === "off") {
      await threadsData.set(event.threadID, { lockedName: null }, "settings");
      return; // silently turn off
    }

    // Save locked name in thread settings
    await threadsData.set(event.threadID, { lockedName: text }, "settings");
  },

  onEvent: async function({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;

    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedName = settings.lockedName;
    if (!lockedName) return; // do nothing if lock is off

    // silently revert any name change
    if (event.logMessageData && event.logMessageData.name !== lockedName) {
      try {
        await api.setTitle(lockedName, event.threadID);
      } catch (err) {
        // silently ignore, works even without admin
      }
    }
  }
};
