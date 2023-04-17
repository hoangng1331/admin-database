const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
});
const Size = model('Size', sizeSchema);
module.exports = Size;
