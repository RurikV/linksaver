import styled from "styled-components";

export const Wrapper = styled.div`
  background: #fff;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  max-width: 400px;
  padding: ${(props) => props.theme.spacing.md};
  position: fixed;
  right: ${(props) => props.theme.spacing.lg};
  top: ${(props) => props.theme.spacing.lg};
  width: 100%;
  z-index: 999;
`;
