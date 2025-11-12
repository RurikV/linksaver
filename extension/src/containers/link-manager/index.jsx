import React, { useEffect, useState } from "react";

import Error from "../../components/error";
import Header from "../../components/header";
import Footer from "../../components/footer";
import TagSelector from "../../components/tag-selector";

import { Wrapper } from "./styles";

const states = {
  1: "Saving Link...",
  2: "Link Saved!",
  3: "Updating Link...",
  4: "Link Updated!",
  5: "Removing Link...",
  6: "Link Removed!",
};

const LinkManager = () => {
  const [state, setState] = useState(states[1]);
  const [token, setToken] = useState();
  const [error, setError] = useState(false);
  const [link, setLink] = useState();
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const addLink = async (authToken) => {
      try {
        const res = await fetch(
          `${process.env.API_URL}/links?returnAllTags=true`,
          {
            method: "POST",
            body: JSON.stringify({
              url: window.location.href,
              title: document.title,
              tags: [],
            }),
            headers: {
              "X-LINK-SAVER": "true",
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setState(states[2]);
        setLink(data.link);
        setTags(data.link.tags);
        setAvailableTags(data.tags);
      } catch (err) {
        setError(true);
      }
    };

    chrome.storage.local.get(["auth_token"], (result) => {
      if (result.auth_token) {
        addLink(result.auth_token);
        setToken(result.auth_token);
      } else {
        chrome.storage.local.remove(["auth_token"], () => {
          setError(true);
        });
      }
    });
  }, []);

  const handleTagChange = async (selectedTags) => {
    setTags(selectedTags);
    setState(states[3]);
    try {
      const res = await fetch(`${process.env.API_URL}/links/${link.linkId}`, {
        method: "PUT",
        body: JSON.stringify({
          tags: selectedTags,
        }),
        headers: {
          "X-LINK-SAVER": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      const data = await res.json();

      // Set tags again with IDs
      setTags(data.link.tags);
      setState(states[4]);
    } catch (err) {
      setError(true);
    }
  };

  const handleRemove = async () => {
    setState(states[5]);
    try {
      const res = await fetch(`${process.env.API_URL}/links/${link.linkId}`, {
        method: "DELETE",
        headers: {
          "X-LINK-SAVER": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      setState(states[6]);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <Wrapper>
      {error ? (
        <Error>An error has occured.</Error>
      ) : (
        <>
          <Header
            state={state}
            showRemove={state !== states[5] && state !== states[6]}
            onRemove={handleRemove}
          />
          {state !== states[5] && state !== states[6] && (
            <TagSelector
              availableTags={availableTags}
              tags={tags}
              setTags={handleTagChange}
            />
          )}
          <Footer />
        </>
      )}
    </Wrapper>
  );
};

export default LinkManager;
