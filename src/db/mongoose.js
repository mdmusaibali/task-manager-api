//This file just ensures connection to mongoose
const mongoose = require("mongoose");

//mongoose latest
mongoose.connect(process.env.MONGODB_URL);
