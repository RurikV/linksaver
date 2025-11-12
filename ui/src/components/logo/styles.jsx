import styled from "styled-components";

export const Image = styled.img`
  height: auto;
  max-width: ${(props) => props.$maxWidth};
  width: 100%;
`;
