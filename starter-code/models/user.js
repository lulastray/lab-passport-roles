const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  rol: {
    type: String,
    enum: ["BOSS", "DEVELOPER", "TA"],
    default: "BOSS"
  }
})

const User = mongoose.model("User", userSchema);
module.exports = User;