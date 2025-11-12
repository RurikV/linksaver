import styled from "styled-components";

export const Wrapper = styled.div`
  > * + * {
    margin-top: ${(props) => props.theme.spacing.md};
  }
`;

export const Title = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.xl};
`;
