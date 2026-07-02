const bcrypt = require("bcrypt");

bcrypt.hash("4567", 10)
  .then(hash => console.log(hash))
  .catch(err => console.error(err));
  