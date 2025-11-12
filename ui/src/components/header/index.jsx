import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { actions } from "../../constants/actions";
import { localStorageKeys } from "../../constants/local-storage";
import { useAppContext } from "../../context";
import Logo from "../logo";

import { Button, Content, Wrapper } from "./styles";

const Header = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(localStorageKeys.AUTH_TOKEN);
    dispatch({
      type: actions.UPDATE_USER,
      payload: { details: null, token: null },
    });
    navigate("/login");
    toast.success("You are now logged out");
  };

  return (
    <Wrapper>
      <Content>
        <Logo />
        <Button onClick={handleLogout}>Logout</Button>
      </Content>
    </Wrapper>
  );
};

export default Header;
