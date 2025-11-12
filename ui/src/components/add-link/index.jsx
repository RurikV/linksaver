import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import get from "lodash/get";
import * as Yup from "yup";

import { useApi } from "../../hooks/use-api";
import { useAppContext } from "../../context";
import { actions } from "../../constants/actions";
import Button from "../button";
import Error from "../error";
import Dialog from "../dialog";
import Input from "../input";
import TagSelector from "../tag-selector";

import { Title, Wrapper } from "./styles";

const AddLink = ({ open, onClose }) => {
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(false);
  const { loading, postRequest } = useApi();
  const { dispatch } = useAppContext();

  const formik = useFormik({
    initialValues: {
      url: "",
    },
    validationSchema: Yup.object({
      url: Yup.string()
        .url("A valid URL is required")
        .required("A URL is required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await postRequest("links", { ...values, tags });
        if (res?.data) {
          if (!res.data.isNew) {
            toast.error("Link already exists");
            handleClose();
            return;
          }

          if (res.data.tags.length) {
            dispatch({
              type: actions.ADD_TAGS,
              payload: res.data.tags,
            });
          }

          dispatch({
            type: actions.ADD_LINK,
            payload: res.data.link,
          });

          toast.success("Successfully saved link");
          handleClose();
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

  const handleClose = () => {
    formik.resetForm();
    setTags([]);
    setError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Wrapper>
        <Title>Add new link</Title>
        {error && <Error>{error}</Error>}
        <div>
          <Input
            id="url"
            name="url"
            label="URL"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.url}
            error={formik.touched.url && formik.errors.url}
            placeholder="Enter a url"
          />
        </div>
        <div>
          <TagSelector tags={tags} setTags={setTags} />
        </div>
        <Button type="button" onClick={formik.handleSubmit} isLoading={loading}>
          Add Link
        </Button>
      </Wrapper>
    </Dialog>
  );
};

export default AddLink;
