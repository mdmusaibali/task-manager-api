const express = require("express");
const router = new express.Router();
const Task = require("./../models/task");
const auth = require("./../middleware/auth");

// Creating task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
    console.log(sort);
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Getting current user's task by task id
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Updating current user's task by task id
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ["description", "completed"];
  const requestedUpdates = Object.keys(req.body);
  const isValidUpdate = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send("Invalid updates!");
  }
  try {
    const task = await Task.findById({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    requestedUpdates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Deleting current user's task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
