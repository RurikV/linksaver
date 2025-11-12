import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";
import get from "lodash/get";

import { useApi } from "../../hooks/use-api";
import { useAppContext } from "../../context";
import { actions } from "../../constants/actions";
import Button from "../button";
import Dialog from "../dialog";
import Input from "../input";
import Error from "../error";
import TagSelector from "../tag-selector";

import { Title, Wrapper, Divider, Delete } from "./styles";

const EditLink = ({ open, onClose, link }) => {
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(false);
  const { putRequest, deleteRequest } = useApi();
  const { dispatch } = useAppContext();

  const handleSave = async () => {
    setError(false);

    // No changes to make
    if (isEqual(tags, link.tags)) {
      toast.success("Successfully saved link");
      onClose();
      return;
    }

    try {
      const res = await putRequest(`links/${link.linkId}`, { tags });

      if (res?.data) {
        if (res.data.tags.length) {
          dispatch({
            type: actions.ADD_TAGS,
            payload: res.data.tags,
          });
        }

        dispatch({
          type: actions.UPDATE_LINK,
          payload: res.data.link,
        });

        toast.success("Successfully saved link");
        onClose();
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
  };

  const handleDelete = async () => {
    setError(false);
    try {
      const res = await deleteRequest(`links/${link.linkId}`);
      if (res.status === 200) {
        toast.success("Successfully deleted link");
        dispatch({
          type: actions.DELETE_LINK,
          payload: link.linkId,
        });
        onClose();
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
  };

  useEffect(() => {
    if (link) {
      setTags(link.tags);
    }
  }, [link]);

  if (!link) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <Wrapper>
        <Title>Edit link</Title>
        {error && <Error>{error}</Error>}
        <div>
          <Input label="URL" value={link.url} readOnly />
        </div>
        <div>
          <TagSelector tags={tags} setTags={setTags} />
        </div>
        <Button onClick={handleSave}>Save Link</Button>
        <div>
          <Divider>Or</Divider>
          <Delete onClick={handleDelete}>Delete Link</Delete>
        </div>
      </Wrapper>
    </Dialog>
  );
};

export default EditLink;
