const bcrypt = require("bcrypt");

bcrypt.hash("benta123", 10)
  .then(hash => console.log(hash))
  .catch(err => console.error(err));
  