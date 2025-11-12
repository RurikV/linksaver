import styled from "styled-components";

export const Wrapper = styled.div`
  align-items: center;
  background: ${(props) => props.theme.colors.bg};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
`;

export const LinkSave = styled.div`
  align-items: center;
  display: flex;
  flex: 1;

  img {
    max-width: 35px;
    margin-right: ${(props) => props.theme.spacing.sm};
    height: auto;
  }

  h1 {
    color: ${(props) => props.theme.colors.text};
    font-size: ${(props) => props.theme.text.lg};
    margin: 0;
  }
`;

export const LinkRemove = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  font-size: ${(props) => props.theme.text.xs};
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;
