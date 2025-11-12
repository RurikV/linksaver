import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
`;

export const InputWrapper = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  display: inline-flex;
  padding: ${(props) => props.theme.spacing.sm};
  width: 100%;
`;

export const Tag = styled.span`
  background: rgba(0, 0, 0, 0.1);
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};
  font-size: 10px;
  margin-right: 5px;
  padding: 2px 4px;
  white-space: nowrap;
`;

export const Input = styled.input`
  background: #fff;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.sm};
  width: 100%;

  &:focus {
    outline: none;
  }
`;

export const Suggestions = styled.div`
  background: #fff;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius};
  color: ${(props) => props.theme.colors.text};
  padding: ${(props) => props.theme.spacing.sm};
  position: absolute;
  width: 100%;

  ul {
    list-style: none;
  }

  li {
    cursor: pointer;
    font-size: ${(props) => props.theme.text.sm};
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      text-decoration: underline;
    }
  }
`;
