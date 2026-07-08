const bcrypt = require("bcrypt");

bcrypt.hash("22104", 10)
  .then(hash => console.log(hash))
  .catch(err => console.error(err));
  