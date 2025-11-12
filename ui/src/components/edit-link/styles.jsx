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

export const Divider = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.md};
  font-weight: 600;
  margin: ${(props) => props.theme.spacing.lg} auto;
  text-align: center;
`;

export const Delete = styled.button`
  background: ${(props) => props.theme.colors.error};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius};
  color: #fff;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.sm};
  width: 100%;
`;
