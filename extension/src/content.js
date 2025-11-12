import React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import "@webcomponents/custom-elements";

import { theme } from "./constants/theme";

import App from "./app";

class LinkSaver extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement("div");
    this.attachShadow({ mode: "open" }).appendChild(mountPoint);

    const root = createRoot(this.shadowRoot);
    root.render(
      <StyleSheetManager target={this.shadowRoot}>
        <ThemeProvider theme={theme}>
          <App container="content" />
        </ThemeProvider>
      </StyleSheetManager>
    );
  }
}
customElements.define("link-saver", LinkSaver);

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.message === "link_saver_toggle_extension") {
    const elems = document.getElementsByTagName("link-saver");

    if (!elems.length) {
      const storage = await chrome.storage.local.get(["auth_token"]);

      if (!storage.auth_token) {
        chrome.runtime.sendMessage({ message: "link_saver_auth_flow" });
        return;
      }

      const linkSaver = document.createElement("link-saver");
      document.body.appendChild(linkSaver);

      function removeLinkSaver(e) {
        if (!linkSaver.contains(e.target)) {
          linkSaver.remove();
          document.removeEventListener("click", removeLinkSaver);
        }
      }
      document.addEventListener("click", removeLinkSaver);
    }
  }
});

window.addEventListener("message", function (event) {
  if (
    event.origin === process.env.UI_URL &&
    event.data?.type === "link-saver-auth"
  ) {
    const token = event.data.token;
    // Send the token to the background script
    chrome.runtime.sendMessage({
      message: "link_saver_token_received",
      token: token,
    });
  }
});
