import styled from "styled-components";

export const Wrapper = styled.div`
  align-items: center;
  background: rgb(0 0 0 / 0.4);
  bottom: 0;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  overflow: hidden;
  padding: ${(props) => props.theme.spacing.md};
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 99;
`;

export const Content = styled.div`
  background: #fff;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  max-width: 400px;
  padding: ${(props) => props.theme.spacing.md};
  width: 100%;
`;
