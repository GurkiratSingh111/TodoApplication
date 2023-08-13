//forever, pm2 => even if your backend goes because of erroneous input, these libraries bring the server up
//pm2 start dist/index.js => to start the server
//pm2 to kill the server
import jwt from "jsonwebtoken";
import express from "express";
import { authenticateJwt, SECRET } from "../middleware/";
import { User } from "../db";
const router = express.Router();
import { z } from "zod";

const signupInput = z.object({
  username: z.string().min(5).max(50).email(),
  password: z.string().min(1).max(20),
});

router.post("/signup", async (req, res) => {
  const parsedInput = signupInput.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({
      error: parsedInput.error.message,
    });
    return;
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;

  // const { username, password } = req.body;
  // if (typeof username !== "string") {
  //   res.status(411).json({
  //     msg: "You sent wrong input, username should be string",
  //   });
  //   return;
  // }
  // if (typeof password !== "string") {
  //   res.status(411).json({
  //     msg: "You sent wrong input, password should be string",
  //   });
  //   return;
  // }

  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: "1h" });
    res.json({ message: "User created successfully", token });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.get("/me", authenticateJwt, async (req, res) => {
  const userId = req.headers["userId"];
  const user = await User.findOne({ _id: userId });
  if (user) {
    res.json({ username: user.username });
  } else {
    res.status(403).json({ message: "User not logged in" });
  }
});

export default router;
