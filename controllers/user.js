const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/tokens");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../helpers/mailer");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      username,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "invalid email address",
      });
    }

    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message: "email address already taken",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "first_name must be between 3 and 30 characters",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "last_name must be between 3 and 30 characters",
      });
    }

    if (!validateLength(password, 6, 50)) {
      return res.status(400).json({
        message: "password must be between 6 and 40 characters",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      username: newUsername,
      password: cryptedPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;

    sendVerificationEmail(user.email, user.first_name, url);

    const token = generateToken({ id: user._id.toString() }, "7d");

    return res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "register success! please activate your email to start",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const userToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(userToken.id);
    if (user.verified) {
      return res.status(400).json({
        message: "account already verified",
      });
    } else {
      await User.findByIdAndUpdate(user._id, { verified: true });
      return es.status(200).json({
        message: "account has been activated successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "the email address you entered is not cornected to an account",
      });
    }

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials. Please try again.",
      });
    }

    const token = generateToken({ id: user._id.toString() }, "7d");

    return res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "login success",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
