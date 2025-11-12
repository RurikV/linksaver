import styled from "styled-components";

export const Label = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.sm};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

export const TagWrapper = styled.div`
  margin: -5px;

  > * {
    margin: 5px;
  }
`;
