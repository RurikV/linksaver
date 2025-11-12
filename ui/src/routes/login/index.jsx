import { useState } from "react";
import { useTheme } from "styled-components";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import get from "lodash/get";
import * as Yup from "yup";

import { useAppContext } from "../../context";
import { useApi } from "../../hooks/use-api";
import { actions } from "../../constants/actions";
import { localStorageKeys } from "../../constants/local-storage";
import { useAuth } from "../../hooks/use-auth";
import { useQueryParams } from "../../hooks/use-query-params";
import Card from "../../components/card";
import Logo from "../../components/logo";
import Input from "../../components/input";
import Button from "../../components/button";
import Error from "../../components/error";

import {
  Content,
  Wrapper,
  LogoWrapper,
  Title,
  SecondaryAction,
} from "./styles";

const LoginRoute = () => {
  useAuth({ onAuth: "/" });
  const { dispatch } = useAppContext();
  const [error, setError] = useState(false);
  const { loading, postRequest } = useApi();
  const navigate = useNavigate();
  const theme = useTheme();
  const searchParams = useQueryParams();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("An email is required"),
      password: Yup.string().required("A password is required"),
    }),
    onSubmit: async (values) => {
      setError(false);
      try {
        const res = await postRequest("auth/login", { ...values });
        if (res?.data) {
          localStorage.setItem(localStorageKeys.AUTH_TOKEN, res.data.token);
          dispatch({
            type: actions.UPDATE_USER,
            payload: {
              details: res.data.user,
              token: res.data.token,
            },
          });

          if (searchParams.get("type") === "extension_auth_flow") {
            window.postMessage(
              { type: "link-saver-auth", token: res.data.token },
              "*"
            );
          } else {
            toast.success("You are now logged in");
            navigate("/");
          }
        } else {
          setError("An error has occured");
        }
      } catch (err) {
        const errorMsg = get(
          err,
          "response.data.error",
          "An error has occurred."
        );
        setError(errorMsg);
      }
    },
  });

  return (
    <Wrapper>
      <Card maxWidth={theme.sizes.md}>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <Title>Login to your account</Title>
        {error && <Error>{error}</Error>}
        <form onSubmit={formik.handleSubmit}>
          <Content>
            <Input
              id="email"
              type="email"
              name="email"
              label="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && formik.errors.email}
              placeholder="Enter your email"
            />
            <Input
              id="password"
              type="password"
              name="password"
              label="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              error={formik.touched.password && formik.errors.password}
              placeholder="Enter your password"
            />
            <Button
              type="submit"
              onClick={formik.handleSubmit}
              isLoading={loading}
            >
              Login
            </Button>
          </Content>
        </form>
      </Card>
      <SecondaryAction to="/register">
        Not registered? Sign up now.
      </SecondaryAction>
    </Wrapper>
  );
};

export default LoginRoute;
