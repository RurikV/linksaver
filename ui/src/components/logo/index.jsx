import logoSrc from "./icon.png";
import { Image } from "./styles";

const Logo = ({ maxWidth = "40px" }) => {
  return <Image src={logoSrc} alt="LinkSaver" $maxWidth={maxWidth} />;
};

export default Logo;
