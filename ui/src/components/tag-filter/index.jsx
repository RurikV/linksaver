import { useAppContext } from "../../context";
import Tag from "../tag";

import { Label, TagWrapper } from "./styles";

const TagFilter = ({ selected, onSelect }) => {
  const { state } = useAppContext();

  return (
    <div>
      <Label>Tag filter</Label>
      <TagWrapper>
        {state.tags.map((tag) => (
          <Tag
            key={tag.tagId}
            tagId={tag.tagId}
            title={tag.title}
            active={selected.includes(tag.tagId)}
            onClick={() => {
              onSelect(tag.tagId);
            }}
          />
        ))}
      </TagWrapper>
    </div>
  );
};

export default TagFilter;
