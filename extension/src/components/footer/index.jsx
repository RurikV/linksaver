import React from "react";

import { Links, Settings, TextButton, Wrapper } from "./styles";

const Footer = () => {
  const openOptions = () => {
    chrome.runtime.sendMessage({
      message: "link_saver_open_options",
    });
  };

  const openSaves = () => {
    chrome.runtime.sendMessage({
      message: "link_saver_open_saves",
    });
  };

  return (
    <Wrapper>
      <Links>
        <TextButton onClick={openSaves}>My Link Saves</TextButton>
      </Links>
      <Settings>
        <TextButton onClick={openOptions}>Settings</TextButton>
      </Settings>
    </Wrapper>
  );
};

export default Footer;
