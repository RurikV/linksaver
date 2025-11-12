import styled from "styled-components";

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
