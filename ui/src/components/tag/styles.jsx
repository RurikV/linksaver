import styled from "styled-components";

export const Wrapper = styled.button`
  border: 1px solid
    ${(props) => (props.$active ? "#000" : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: rgb(249 250 251 / 0.5);
  color: ${(props) => props.theme.colors.text};
  display: inline-block;
  font-size: ${(props) => props.theme.text.xs};
  padding: 3px 8px;
  pointer-events: ${(props) => (props.$canClick ? "auto" : "none")};

  &:hover {
    border-color: ${(props) =>
      props.$canClick ? "#000" : props.theme.colors.border};
  }
`;
