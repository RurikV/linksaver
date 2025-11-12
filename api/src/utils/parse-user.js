exports.parseUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
});
