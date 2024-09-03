// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const saltRounds = 10;
const secretKey = process.env.SECRET_KEY;
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
app.use(cookieParser());
app.use(cors());

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: email });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found", ok: false });
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error", ok: false });
      }
      if (result) {
        const token = jwt.sign({ email: foundUser.email }, secretKey, {
          expiresIn: "1h",
        });

        // console.log(token);

        // jwt token als cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, //beim hosten auf true setzen
          maxAge: 3600000, //1hr
        });
        console.log(cookies);
        // console.log("plain text password", password);
        // console.log("hashed password", foundUser.password);

        return res
          .status(200)
          .json({ token, ok: true, message: "Login successfull" });
      } else {
        return res
          .status(401)
          .json({ message: "Email or password wrong", ok: false });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server issues, try again", ok: false });
  }
});

// Register route
app.post("/register", async (req, res) => {
  bcrypt.hash(req.body.password, saltRounds).then(async function (hash) {
    const newUser = new User({
      email: req.body.email,
      password: hash,
    });
    try {
      await newUser.save();
      res.json({ success: true, message: "New user created" });
    } catch (err) {
      res.status(500).json({ success: false, message: "something went wrong" });
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
