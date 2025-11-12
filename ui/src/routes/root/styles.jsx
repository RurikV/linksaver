import styled from "styled-components";

export const Wrapper = styled.div`
  background: ${(props) => props.theme.colors.bg};
  height: 100%;
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
`;

export const Loading = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl};
`;

export const Content = styled.div`
  padding: 0 ${(props) => props.theme.spacing.md};
`;

export const Grid = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing.lg};
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: ${(props) => props.theme.spacing.xl} auto;
  max-width: ${(props) => props.theme.width};
`;

export const LeftCol = styled.div`
  grid-column: span 1 / span 1;
`;

export const RightCol = styled.div`
  grid-column: span 3 / span 3;
`;

export const LinkSavesHeader = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.md};
`;

export const LinksSaved = styled.h2`
  color: ${(props) => props.theme.colors.text};
`;

export const AddLink = styled.div`
  margin-left: auto;
`;

export const Links = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing.lg};
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;
