const crypto = require("crypto");

// to create new secret key
const id = crypto.randomBytes(100000000).toString("hex");
console.log(id);
