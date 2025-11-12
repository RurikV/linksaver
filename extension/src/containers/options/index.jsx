import React, { useEffect, useState } from "react";

import Button from "../../components/button";
import Card from "../../components/card";
import Spinner from "../../components/spinner";

import { DL, DT, DD, Grid, Image, Wrapper, Title, Logout } from "./styles";

const statuses = {
  LOADING: "loading",
  NO_USER: "no-user",
  USER: "user",
};

const Options = () => {
  const [data, setData] = useState({ status: statuses.LOADING });

  useEffect(() => {
    const fetchUser = async (token) => {
      try {
        const res = await fetch(`${process.env.API_URL}/auth`, {
          method: "GET",
          headers: {
            "X-LINK-SAVER": "true",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setData({ status: statuses.NO_USER });
          return;
        }

        const data = await res.json();
        setData({
          status: statuses.USER,
          details: data,
        });
      } catch (err) {
        setData({ status: statuses.NO_USER });
      }
    };

    chrome.storage.local.get(["auth_token"], (result) => {
      if (result.auth_token) {
        fetchUser(result.auth_token);
      } else {
        setData({ status: statuses.NO_USER });
      }
    });
  }, []);

  const handleLogout = () => {
    chrome.storage.local.remove(["auth_token"], () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.remove(tabs[0].id);
      });
    });
  };

  const openShortcuts = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  };

  const openSaves = () => {
    chrome.tabs.create({ url: process.env.UI_URL });
  };

  if (data.status === "loading") {
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    );
  }

  if (data.status === "no-user") {
    window.location.href = `${process.env.UI_URL}/login?type=extension_auth_flow`;
    return null;
  }

  return (
    <Wrapper>
      <Image src={chrome.runtime.getURL("public/icon.png")} alt="LinkSaver" />
      <Card maxWidth="500px">
        <Title>LinkSaver Extension Options</Title>
        <DL>
          <Grid>
            <DT>Logged in as</DT>
            <DD>
              {data.details.user.name} (
              <Logout onClick={handleLogout}>Logout</Logout>)
            </DD>
          </Grid>
          <Grid>
            <DT>Keyboard shortcut</DT>
            <DD>
              <Button onClick={openShortcuts}>Create shortcut</Button>
            </DD>
          </Grid>
          <Grid>
            <DT>My link saves</DT>
            <DD>
              <Button onClick={openSaves}>View saves</Button>
            </DD>
          </Grid>
        </DL>
      </Card>
    </Wrapper>
  );
};

export default Options;
