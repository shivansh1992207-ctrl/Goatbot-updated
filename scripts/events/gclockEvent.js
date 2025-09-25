module.exports = {
  config: { name: "gclockEvent" },

  onEvent: async function({ event, threadsData, api }) {
    if (event.logMessageType !== "log:thread-name") return;
    const settings = await threadsData.get(event.threadID, "settings") || {};
    const lockedName = settings.lockedName;
    if (!lockedName) return; // lock off
    if (event.logMessageData.name !== lockedName) {
      try { await api.setTitle(lockedName, event.threadID); } catch(e) {}
    }
  }
};￼Enter
