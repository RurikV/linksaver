import { ButtonElement } from "./styles";

const Button = ({
  children,
  disabled = false,
  isLoading = false,
  ...props
}) => {
  return (
    <ButtonElement {...props} disabled={disabled || isLoading}>
      {isLoading ? "Loading..." : children}
    </ButtonElement>
  );
};

export default Button;
