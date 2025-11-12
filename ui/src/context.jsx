import { createContext, useReducer, useContext } from "react";

import { actions } from "./constants/actions";

const initialState = {
  user: {
    details: null,
    token: null,
  },
  links: [],
  tags: [],
};

const AppContext = createContext(initialState);

const reducer = (state, action) => {
  switch (action.type) {
    case actions.UPDATE_USER: {
      return {
        ...state,
        user: action.payload,
      };
    }
    case actions.ADD_LINK: {
      return {
        ...state,
        links: [...state.links, action.payload],
      };
    }
    case actions.UPDATE_LINKS: {
      return {
        ...state,
        links: action.payload,
      };
    }
    case actions.UPDATE_LINK: {
      const linkIndex = state.links.findIndex(
        (l) => l.linkId === action.payload.linkId
      );

      if (linkIndex === -1) return state;

      const newLinks = [...state.links];
      newLinks[linkIndex] = action.payload;

      return {
        ...state,
        links: newLinks,
      };
    }
    case actions.DELETE_LINK: {
      return {
        ...state,
        links: state.links.filter((l) => l.linkId !== action.payload),
      };
    }
    case actions.ADD_TAGS: {
      return {
        ...state,
        tags: [...state.tags, ...action.payload],
      };
    }
    case actions.UPDATE_TAGS: {
      return {
        ...state,
        tags: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

// App Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to access the context
export const useAppContext = () => useContext(AppContext);
