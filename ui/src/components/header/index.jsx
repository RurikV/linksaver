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
              background: 'transparent',
              color: '#333',
              border: '1px solid #ddd',
              padding: '8px 16px',
              fontSize: '0.9em',
              fontWeight: '500',
              borderRadius: '4px'
            }}
          >
            Content Hub
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </Content>
    </Wrapper>
  );
};

export default Header;
