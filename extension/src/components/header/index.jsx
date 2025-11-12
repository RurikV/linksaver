import React from "react";

import { LinkRemove, LinkSave, Wrapper } from "./styles";

const Header = ({ state, onRemove, showRemove = true }) => {
  return (
    <Wrapper>
      <LinkSave>
        <img src={chrome.runtime.getURL("public/icon.png")} alt="LinkSaver" />
        <h1>{state}</h1>
      </LinkSave>
      {showRemove && <LinkRemove onClick={onRemove}>Remove</LinkRemove>}
    </Wrapper>
  );
};

export default Header;
