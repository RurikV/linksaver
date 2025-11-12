const mongoose = require("mongoose");

const Link = mongoose.model("Link");

exports.deleteLink = async (req, res) => {
  const { userId, params } = req;
  const { linkId } = params;

  // We use userId to ensure no one can delete another user's links
  const deletedLink = await Link.findOneAndDelete({ linkId, user: userId });

  if (!deletedLink) {
    res.status(400).send({
      error: "Link does not exist or you do not have access to it",
    });
    return;
  }

  res.status(200).send();
};
