import { useEffect, useRef } from "react";

import { useOutsideClick } from "../../hooks/use-click-outside";

import { Content, Wrapper } from "./styles";

const Dialog = ({ children, open = true, onClose }) => {
  const dialogRef = useRef();
  useOutsideClick(dialogRef, () => {
    onClose();
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
  }, [open]);

  if (!open) return null;

  return (
    <Wrapper>
      <Content ref={dialogRef}>{children}</Content>
    </Wrapper>
  );
};

export default Dialog;
