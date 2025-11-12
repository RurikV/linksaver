import styled from "styled-components";

export const Wrapper = styled.div`
  align-items: center;
  background: ${(props) => props.theme.colors.bg};
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: ${(props) => props.theme.spacing.xl};
  width: 100vw;
`;

export const Image = styled.img`
  height: auto;
  max-width: 40px;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.xl};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

export const Logout = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

export const DL = styled.dl`
  font-size: ${(props) => props.theme.text.sm};

  > div:last-child {
    padding-bottom: 0;
  }
`;

export const Grid = styled.div`
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: ${(props) => props.theme.spacing.md} 0;
`;

export const DT = styled.dt`
  font-weight: 800;
  grid-column: span 2 / span 2;
`;

export const DD = styled.dd`
  grid-column: span 3 / span 3;
`;
