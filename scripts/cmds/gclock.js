module.exports = {
  config: {
    name: "gclock",
    version: "1.2",
    author: "Anurag Mishra",
    role: 1,
    description: "Lock or unlock group name",
    category: "box chat",
    guide: "{pn} <name> | {pn} off"
  },

  onStart: async function({ message, event, args, threadsData, api }) {
    if (!args[0]) return;
    if (args[0].toLowerCase() === "off") {
      await threadsData.set(event.threadID, { lockedName: null }, "settings");
      return;
    }
    const newName = args.join(" ");
    await threadsData.set(event.threadID, { lockedName: newName }, "settings");
    try { await api.setTitle(newName, event.threadID); } catch(e) {}
  }
};
