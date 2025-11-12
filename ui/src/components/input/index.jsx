import { Label, Error, InputElement } from "./styles";

const Input = ({ type = "text", label = false, error = false, ...props }) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <InputElement type={type} {...props} $hasError={!!error} />
      {error && <Error>{error}</Error>}
    </div>
  );
};

export default Input;
