exports.notFound = (req, res) => {
  res.status(404);
  res.send({
    error: `Not found: ${req.originalUrl}`,
  });
};
