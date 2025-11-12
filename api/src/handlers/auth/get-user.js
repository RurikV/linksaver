exports.getUser = async (req, res) => {
  const { user, token } = req;

  res.status(200).send({
    token,
    user,
  });
};
