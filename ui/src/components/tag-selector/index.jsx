import { useState } from "react";

import { useAppContext } from "../../context";

import {
  Input,
  InputWrapper,
  Label,
  Suggestions,
  Tag,
  Wrapper,
} from "./styles";

const TagSelector = ({ tags, setTags }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { state } = useAppContext();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value) {
      setSuggestions(
        state.tags.filter(
          (tag) =>
            tag.title.toLowerCase().includes(value.toLowerCase()) &&
            !tags.some((tag) => tag.title.toLowerCase() === value.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && input) {
      // Prevent duplicate tags either already in list or in state
      const existingTag = state.tags.find(
        (tag) => tag.title.toLowerCase() === input.toLowerCase()
      );
      if (existingTag) {
        setTags([...tags, existingTag]);
        setInput("");
        setSuggestions([]);
      } else if (
        !tags.some((tag) => tag.title.toLowerCase() === input.toLowerCase())
      ) {
        setTags([...tags, { title: input }]);
        setInput("");
        setSuggestions([]);
      }
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t.title !== tag.title));
  };

  const addTagFromSuggestion = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInput("");
    setSuggestions([]);
  };

  return (
    <Wrapper>
      <Label>Tags</Label>
      <InputWrapper>
        {tags.map((tag, idx) => (
          <Tag key={idx} onClick={() => removeTag(tag)}>
            {tag.title}
          </Tag>
        ))}
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length ? "" : "Start typing and press enter to add"}
        />
      </InputWrapper>
      {suggestions.length > 0 && (
        <Suggestions>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => addTagFromSuggestion(suggestion)}>
                {suggestion.title}
              </li>
            ))}
          </ul>
        </Suggestions>
      )}
    </Wrapper>
  );
};

export default TagSelector;
