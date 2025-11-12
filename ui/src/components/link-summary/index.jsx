import Truncate from "react-truncate-markup";

import Card from "../card";
import Tag from "../tag";
import {
  Details,
  Link,
  Title,
  Domain,
  Edit,
  TagWrapper,
  TagList,
  MoreTags,
} from "./styles";

const LinkSummary = ({ link, onEdit }) => {
  if (!link) return null;

  const hostname = new URL(link.url).hostname;

  const handleEdit = (e) => {
    // Stop event bubbling from surrounding link
    e.preventDefault();
    onEdit(link.linkId);
  };

  return (
    <Link href={link.url} target="_blank">
      <Card fullHeight>
        <Edit onClick={handleEdit}>Edit</Edit>
        <Details>
          <Domain>{hostname}</Domain>
          <Truncate lines={3}>
            <Title>{link.title}</Title>
          </Truncate>
          <TagWrapper>
            <Truncate lines={1} ellipsis={() => <MoreTags>+ More</MoreTags>}>
              <TagList>
                {link.tags.map((tag) => (
                  <Truncate.Atom key={tag.tagId}>
                    <Tag tagId={tag.tagId} title={tag.title} />
                  </Truncate.Atom>
                ))}
              </TagList>
            </Truncate>
          </TagWrapper>
        </Details>
      </Card>
    </Link>
  );
};

export default LinkSummary;
