import { useTheme } from "styled-components";

import { useAuth } from "../../hooks/use-auth";
import Card from "../../components/card";
import Logo from "../../components/logo";

import { Content, Wrapper, LogoWrapper, Title } from "./styles";

const UnverifiedRoute = () => {
  useAuth({ onAuth: "/", onUnauth: "/login" });
  const theme = useTheme();

  return (
    <Wrapper>
      <Card maxWidth={theme.sizes.md}>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <Title>Verify your email</Title>
        <Content>
          Please click the link on the email we sent you in order to verify your
          account.
        </Content>
      </Card>
    </Wrapper>
  );
};

export default UnverifiedRoute;
