chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, {
    message: "link_saver_toggle_extension",
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const { menuItemId } = info;

  switch (menuItemId) {
    case "linkSaverToggleExtension": {
      chrome.tabs.sendMessage(tab.id, {
        message: "link_saver_toggle_extension",
      });
      break;
    }
    case "linkSaverViewLinkSaves": {
      chrome.tabs.create({ url: process.env.UI_URL });
      break;
    }
    case "linkSaverLogout": {
      chrome.storage.local.remove(["auth_token"]);
      break;
    }
  }
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "linkSaverToggleExtension",
    title: "Save Link",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "linkSaverViewLinkSaves",
    title: "View My Link Saves",
    contexts: ["action"],
  });

  chrome.contextMenus.create({
    id: "linkSaverLogout",
    title: "Logout",
    contexts: ["action"],
  });
});

chrome.runtime.onMessage.addListener(async function (request) {
  switch (request.message) {
    case "link_saver_auth_flow": {
      chrome.tabs.create({
        url: `${process.env.UI_URL}/login?type=extension_auth_flow`,
      });
      break;
    }
    case "link_saver_token_received": {
      const token = request.token;

      chrome.storage.local.set({ auth_token: token }, function () {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.remove(tabs[0].id);
            chrome.runtime.openOptionsPage();
          }
        );
      });
      break;
    }
    case "link_saver_open_saves": {
      chrome.tabs.create({
        url: process.env.UI_URL,
      });
      break;
    }
    case "link_saver_open_options": {
      chrome.runtime.openOptionsPage();
      break;
    }
    default: {
      break;
    }
  }
});
