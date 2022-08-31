const express = require("express");

//mongoose: Ensures connection to mongoose
require("./db/mongoose");

const app = express();
const port = process.env.PORT;

// allows express to parse json from req.body
app.use(express.json());

//ROUTERS
const userRouter = require("./routers/user");
app.use(userRouter);
const taskRouter = require("./routers/task");
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server running on port:", port);
});

// Ref's in mongoose
// const Task = require("./models/task");
// const User = require("./models/user");
// const main = async () => {
//   // Retrieving owner by task id
//   const task = await Task.findById("630a2a35318016bfd886b8a8");
//   await task.populate("owner");
//   console.log("Owner-------------", task.owner);

//   // Retrieving tasks by user id
//   const user = await User.findById("630a29c0318016bfd886b8a0");
//   await user.populate("tasks");
//   console.log("Tasks-------------", user.tasks);
// };
// main();
