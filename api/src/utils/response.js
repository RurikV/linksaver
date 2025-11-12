const response = (handler) => (req, res, next) =>
  handler(req, res, next).catch((err) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(err);
    }

    res.status(err.status || 500);
    res.send({
      error: "An unexpected error has occured.",
    });
  });

module.exports = response;
