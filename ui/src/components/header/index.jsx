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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button
            onClick={() => navigate("/content-hub")}
            style={{
              background: '#64748b',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(100, 116, 139, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Content Hub
          </Button>
          <Button
            onClick={() => navigate("/cms-dashboard")}
            style={{
              background: '#475569',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(71, 85, 105, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            CMS Dashboard
          </Button>
          <Button
            onClick={() => navigate("/plugin-marketplace")}
            style={{
              background: '#334155',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(51, 65, 85, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Plugin Marketplace
          </Button>
          <Button
            onClick={() => navigate("/pattern-lab")}
            style={{
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(30, 41, 59, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Pattern Laboratory
          </Button>
          <Button
            onClick={() => navigate("/architecture-showcase")}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Architecture Showcase
          </Button>
          <Button
            onClick={() => navigate("/development-tools")}
            style={{
              background: '#475569',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.95em',
              fontWeight: '600',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(71, 85, 105, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Development Tools
          </Button>
          <Button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              fontWeight: '500',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </Button>
        </div>
      </Content>
    </Wrapper>
  );
};

export default Header;
