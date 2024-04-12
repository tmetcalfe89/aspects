const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const schema = new Schema({
  inputs: [{
    type: String,
    required: true,
  }],
  outputs: [{
    type: String,
    required: true
  }]
});

module.exports = model("Mix", schema);