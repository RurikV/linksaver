import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";

import { useApi } from "../../hooks/use-api";
import Spinner from "../../components/spinner";
import Card from "../../components/card";
import Success from "../../components/success";
import Error from "../../components/error";

import { Wrapper } from "./styles";

const VerifyRoute = () => {
  const { token } = useParams();
  const { putRequest } = useApi();
  const theme = useTheme();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await putRequest(`auth/verify/${token}`, {});

        setStatus(res?.data?.isVerified ? "success" : "failed");
      } catch (err) {
        console.error(err);
        setStatus("failed");
      }
    };
    verifyToken();
  }, []);

  if (status === "success") {
    return (
      <Wrapper>
        <Card maxWidth={theme.sizes.md}>
          <Success>
            Successfuly verified your email. You may now{" "}
            <Link to="/login">login</Link>.
          </Success>
        </Card>
      </Wrapper>
    );
  }

  if (status === "failed") {
    return (
      <Wrapper>
        <Card maxWidth={theme.sizes.md}>
          <Error>
            The provided verification token is either invalid or has expired.
          </Error>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  );
};

export default VerifyRoute;
