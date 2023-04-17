const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hexcode: { type: String, required: true },
});
const Color = model('Color', colorSchema);
module.exports = Color;
