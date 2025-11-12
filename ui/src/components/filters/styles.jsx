import styled from "styled-components";

export const Wrapper = styled.div`
  > * + * {
    margin-top: ${(props) => props.theme.spacing.md};
  }
`;

export const Reset = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.colors.primaryHover};
  }
`;