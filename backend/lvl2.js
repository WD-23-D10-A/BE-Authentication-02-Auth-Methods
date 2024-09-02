// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const encrypt = require("mongoose-encryption"); //mongoose inhouse encryption

dotenv.config();

const secret = process.env.SECRET_KEY;
const port = process.env.PORT;

const app = express();

// MongoDB Connection
const main = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
};
main()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Login route
app.post("/login", async (req, res) => {});

// Register route
app.post("/register", async (req, res) => {});

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
