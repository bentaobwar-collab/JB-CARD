const bcrypt = require("bcrypt");

bcrypt.hash("2345", 10)
  .then(hash => console.log(hash))
  .catch(err => console.error(err));
  