const express = require("express");
const router = new express.Router();
const User = require("./../models/user");
const auth = require("./../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");

// Creating new user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.appendNewAuthToken();
    sendWelcomeEmail(user.email, user.name);

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logging user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.appendNewAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

// Logout user in current device
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// Logout user from all devices
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// Getting current users details
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Editing user details
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Deleting current user (also deletes user's tasks)
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please send images only"));
    }
    cb(undefined, true);
  },
});

// Upload user image
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Delete avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// Fetching avatar image url
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
