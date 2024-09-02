// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const port = 3000;

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

// Routes

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Home Page" });
});

app.get("/login", (req, res) => {
  res.json({ message: "Please provide your login credentials." });
});

app.get("/register", (req, res) => {
  res.json({ message: "Please provide registration details." });
});

// Login route
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await User.findOne({ email: username });
    if (result) {
      if (result.password === md5(password)) {
        res.json({ success: true, message: "Login successful." });
      } else {
        res.json({ success: false, message: "Incorrect password." });
      }
    } else {
      res.json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Register route
app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });

  console.log(newUser.password);
  try {
    await newUser.save();
    res.json({ success: true, message: "Registration successful." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
