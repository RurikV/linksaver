import styled from "styled-components";
import { Link } from "react-router-dom";

export const Wrapper = styled.div`
  align-items: center;
  background: ${(props) => props.theme.colors.bg};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
`;

export const LogoWrapper = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
  text-align: center;
`;

export const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.text.xl};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  text-align: center;
`;

export const Content = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};

  > * + * {
    margin-top: ${(props) => props.theme.spacing.md};
  }
`;

export const SecondaryAction = styled(Link)`
  color: ${(props) => props.theme.colors.primary};
  margin-top: ${(props) => props.theme.spacing.md};
  text-decoration: none;

  &:hover {
    color: ${(props) => props.theme.colors.primaryHover};
  }
`;
