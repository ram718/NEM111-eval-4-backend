const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(process.env.mongoURL);
// https://scary-jade-gosling.cyclic.app

module.exports = { connection };
