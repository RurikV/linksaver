import styled from "styled-components";

export const Edit = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.textLight};
  cursor: pointer;
  display: none;
  font-size: ${(props) => props.theme.text.xs};
  font-weight: 600;
  padding: 10px;
  position: absolute;
  right: 0;
  top: 0;

  &:hover {
    color: ${(props) => props.theme.colors.text};
  }
`;

export const Link = styled.a`
  position: relative;
  text-decoration: none;

  &:hover {
    ${Edit} {
      display: block;
    }
  }
`;

export const Domain = styled.span`
  color: ${(props) => props.theme.colors.textLight};
  font-size: ${(props) => props.theme.text.xs};
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Title = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.md};
`;

export const TagWrapper = styled.div`
  margin-top: auto;
`;

export const TagList = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};

  > * + * {
    margin-left: ${(props) => props.theme.spacing.sm};
  }
`;

export const MoreTags = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.xs};
`;
