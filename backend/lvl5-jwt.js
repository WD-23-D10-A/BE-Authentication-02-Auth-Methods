// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const saltRounds = 10;
const secretKey = "bababooey"; // Secret key for JWT
const port = 3000;

const app = express();

app.use(cors());

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

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser middleware

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
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: username });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found", ok: false });
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal Server Error", ok: false });
      }
      if (result) {
        const token = jwt.sign({ username: foundUser.username }, secretKey, {
          expiresIn: "1h",
        });

        // Send the JWT token as a cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // Set to true only when using HTTPS
          maxAge: 3600000, // 1 hour
        });
        console.log("Plain text password:", password);
        console.log("Hashed password from DB:", foundUser.password);

        return res.status(200).json({ ok: true, message: "Login successful." });
      } else {
        return res
          .status(401)
          .json({ message: "Email or password wrong", ok: false });
      }
    });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error", ok: false });
  }
});

// Register route
app.post("/register", async (req, res) => {
  bcrypt.hash(req.body.password, saltRounds).then(async function (hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    try {
      await newUser.save();
      res.json({ success: true, message: "Registration successful." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal Server Error", ok: false });
    }
  });
});

// Protected route example
app.get("/secrets", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", ok: false });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized", ok: false });
    }
    res.json({
      message: "Welcome to the secret page!",
      user: decoded.username,
      ok: true,
    });
  });
});

// Logout route
app.get("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the cookie
  res.json({ success: true, message: "Logout successful." });
});

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
