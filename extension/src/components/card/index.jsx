import { Wrapper } from "./styles";

const Card = ({
  children,
  maxWidth = false,
  noPadding = false,
  fullHeight = false,
}) => {
  return (
    <Wrapper
      $maxWidth={maxWidth}
      $noPadding={noPadding}
      $fullHeight={fullHeight}
    >
      {children}
    </Wrapper>
  );
};

export default Card;
