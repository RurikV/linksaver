import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import get from "lodash/get";
import qs from "qs";

import { useApi } from "../../hooks/use-api";
import { useAppContext } from "../../context";
import { actions } from "../../constants/actions";
import Button from "../../components/button";
import Filters from "../../components/filters";
import Header from "../../components/header";
import LinkSummary from "../../components/link-summary";
import AddLinkDialog from "../../components/add-link";
import EditLinkDialog from "../../components/edit-link";
import Spinner from "../../components/spinner";

import {
  AddLink,
  Content,
  Grid,
  LeftCol,
  LinkSavesHeader,
  Links,
  LinksSaved,
  Loading,
  RightCol,
  Wrapper,
} from "./styles";

const RootRoute = () => {
  const isFirstRender = useRef(true);
  const [isCreating, setCreating] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: 1,
    tags: [],
  });
  const { getRequest } = useApi();
  const { state, dispatch } = useAppContext();

  const getTags = async () => {
    const res = await getRequest("tags");
    dispatch({
      type: actions.UPDATE_TAGS,
      payload: get(res, "data.tags", []),
    });
  };

  const getLinks = async (filters) => {
    const queryString = qs.stringify(filters, {
      encode: true,
      arrayFormat: "brackets",
    });

    const res = await getRequest(
      queryString ? `links?${queryString}` : "links"
    );
    dispatch({
      type: actions.UPDATE_LINKS,
      payload: get(res, "data.links", []),
    });
  };

  const getAllData = () => {
    Promise.all([getTags(), getLinks()])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Failed to fetch", err);
        toast.error("Failed to load data");
        setLoading(false);
      });
  };

  const debouncedGetLinks = useCallback(
    debounce((filters) => {
      getLinks(filters);
    }, 800),
    []
  );

  useEffect(() => {
    // We only want to fetch all data on first render
    // Otherwise, we care about the links
    if (isFirstRender.current) {
      getAllData();
      isFirstRender.current = false;
      return;
    }
    debouncedGetLinks(filters);
  }, [filters]);

  if (loading) {
    return (
      <Wrapper>
        <Header />
        <Loading>
          <Spinner />
        </Loading>
      </Wrapper>
    );
  }

  return (
    <>
      <AddLinkDialog open={isCreating} onClose={() => setCreating(false)} />
      <EditLinkDialog
        open={isEditing}
        link={state.links.find((l) => l.linkId === isEditing)}
        onClose={() => setEditing(false)}
      />
      <Wrapper>
        <Header />
        <Content>
          <Grid>
            <LeftCol>
              <Filters filters={filters} setFilters={setFilters} />
            </LeftCol>
            <RightCol>
              <LinkSavesHeader>
                <LinksSaved>My Link Saves ({state.links.length})</LinksSaved>
                <AddLink>
                  <Button onClick={() => setCreating(true)}>+ Add Link</Button>
                </AddLink>
              </LinkSavesHeader>
              <Links>
                {state.links.length ? (
                  state.links.map((link) => (
                    <LinkSummary
                      key={link.linkId}
                      link={link}
                      onEdit={setEditing}
                    />
                  ))
                ) : (
                  <p>No links to display</p>
                )}
              </Links>
            </RightCol>
          </Grid>
        </Content>
      </Wrapper>
    </>
  );
};

export default RootRoute;
