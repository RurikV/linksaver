import styled from "styled-components";

export const Wrapper = styled.div`
  background: ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius};
  color: #fff;
  font-size: ${(props) => props.theme.text.sm};
  padding: ${(props) => props.theme.spacing.sm};
`;
