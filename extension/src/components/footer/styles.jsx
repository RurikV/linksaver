import styled from "styled-components";

export const Wrapper = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  padding-top: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.md};
`;

export const Links = styled.div`
  width: 50%;
`;

export const Settings = styled.div`
  text-align: right;
  width: 50%;
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;
