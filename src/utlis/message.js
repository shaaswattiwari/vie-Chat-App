const generateMessage = (text, username = "Admin") => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  generateMessage,
};
