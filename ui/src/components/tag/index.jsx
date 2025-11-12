import { Wrapper } from "./styles";

const Tag = ({ active = false, onClick = false, title }) => {
  return (
    <Wrapper
      $active={active}
      $canClick={typeof onClick === "function"}
      onClick={() => {
        if (typeof onClick === "function") onClick();
      }}
    >
      {title}
    </Wrapper>
  );
};

export default Tag;
