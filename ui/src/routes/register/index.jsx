import { useTheme } from "styled-components";
import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import get from "lodash/get";
import * as Yup from "yup";

import { useApi } from "../../hooks/use-api";
import { useAppContext } from "../../context";
import { actions } from "../../constants/actions";
import { localStorageKeys } from "../../constants/local-storage";
import { useAuth } from "../../hooks/use-auth";
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

const RegisterRoute = () => {
  useAuth({ onAuth: "/" });
  const { dispatch } = useAppContext();
  const { loading, postRequest } = useApi();
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("A name is required"),
      email: Yup.string()
        .email("A valid email is required")
        .required("An email is required"),
      password: Yup.string().required("A password is required"),
    }),
    onSubmit: async (values) => {
      setError(false);
      try {
        const res = await postRequest("auth/register", { ...values });
        if (res?.data) {
          localStorage.setItem(localStorageKeys.AUTH_TOKEN, res.data.token);
          dispatch({
            type: actions.UPDATE_USER,
            payload: {
              details: res.data.user,
              token: res.data.token,
            },
          });
          navigate("/");
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
        <Title>Create new account</Title>
        {error && <Error>{error}</Error>}
        <form>
          <Content>
            <Input
              id="name"
              name="name"
              label="Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              error={formik.touched.name && formik.errors.name}
              placeholder="Enter your name"
            />
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
              placeholder="Enter a password"
            />
            <Button
              type="submit"
              onClick={formik.handleSubmit}
              isLoading={loading}
            >
              Create account
            </Button>
          </Content>
        </form>
      </Card>
      <SecondaryAction to="/login">
        Already registered? Login now.
      </SecondaryAction>
    </Wrapper>
  );
};

export default RegisterRoute;
