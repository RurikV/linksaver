import styled from "styled-components";

export const Wrapper = styled.div`
  background: #fff;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md};
`;

export const Content = styled.div`
  display: flex;
  margin: 0 auto;
  max-width: ${(props) => props.theme.width};
`;

export const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  margin-left: auto;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;
