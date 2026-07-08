const bcrypt = require("bcrypt");

bcrypt.hash("teddy", 10)
  .then(hash => console.log(hash))
  .catch(err => console.error(err));
  