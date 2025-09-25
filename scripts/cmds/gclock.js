module.exports = {
  config: {
    name: "gclock",               // command name
    aliases: ["gl", "lockgc"],    // command ke short names
    version: "1.0",
    author: "Anurag Mishra",
    role: 2,                      // sirf bot owner ya admin use kar sakta
    category: "admin",
    guide: {
      vi: "Not Available",
      en: "Use: /gclock <group name> to lock group name"
    }
  },

  onStart: async function ({ api, event, args }) {
    const newName = args.join(" ");
    if(!newName) return api.sendMessage("कृपया नया ग्रुप नाम डालें।", event.threadID);

    try {
      // Group ka current info fetch karna
      let info = await api.getThreadInfo(event.threadID);

      // Check if bot is admin
      if(!info.isAdmin) return api.sendMessage("मुझे admin बनाओ, तभी मैं group name lock कर सकता हूँ।", event.threadID);

      // Group ka name change karna
      await api.setTitle(newName, event.threadID);

      // Lock ka record store karna (in-memory example)
      global.lockedGroupNames = global.lockedGroupNames || {};
      global.lockedGroupNames[event.threadID] = newName;

      api.sendMessage(`✅ ग्रुप नाम अब लॉक हो गया: ${newName}`, event.threadID);

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ ग्रुप नाम लॉक करने में त्रुटि हुई।", event.threadID);
    }
  }
};
