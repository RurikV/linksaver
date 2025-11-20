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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            onClick={() => navigate("/content-hub")}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            🚀 Content Hub
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </Content>
    </Wrapper>
  );
};

export default Header;
