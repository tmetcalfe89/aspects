const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true
  }
});

module.exports = model("Aspect", schema);