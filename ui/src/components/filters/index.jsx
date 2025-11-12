import Card from "../card";
import Input from "../input";
import Select from "../select";
import TagFilter from "../tag-filter";

import { Wrapper, Reset } from "./styles";

const options = [
  {
    value: 1,
    text: "Newest first",
  },
  {
    value: 2,
    text: "Oldest first",
  },
];

const Filters = ({ filters, setFilters }) => {
  const handleSearch = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const handleSortChange = (e) => {
    setFilters({
      ...filters,
      sortBy: e.target.value,
    });
  };

  const handleTagChange = (tagId) => {
    let newTags;
    if (filters.tags.includes(tagId)) {
      newTags = filters.tags.filter((t) => t !== tagId);
    } else {
      newTags = [...filters.tags, tagId];
    }

    setFilters({
      ...filters,
      tags: newTags,
    });
  };

  const handleReset = () => {
    setFilters({
      search: "",
      sortBy: 1,
      tags: [],
    });
  };

  return (
    <Card>
      <Wrapper>
        <div>
          <Input
            value={filters.search}
            onChange={handleSearch}
            placeholder="Enter your search term"
            label="Search"
          />
        </div>
        <div>
          <Select
            value={filters.sortBy}
            onChange={handleSortChange}
            label="Sort by"
            options={options}
          />
        </div>
        <div>
          <TagFilter selected={filters.tags} onSelect={handleTagChange} />
        </div>
        <div>
          <Reset onClick={handleReset}>Reset filters</Reset>
        </div>
      </Wrapper>
    </Card>
  );
};

export default Filters;
