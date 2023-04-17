const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const supplierSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    validate: {
      validator: function (value) {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(value);
      },
      message: `{VALUE} is not a valid email!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
    required: [true, 'email is required'],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (value) {
        const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
        return phoneRegex.test(value);
      },
      message: `{VALUE} is not a valid phone!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
  },
  address: { type: String, required: true },
});
supplierSchema.plugin(autoIncrement.plugin, {
  model: "Supplier",
  field: "_id",
  startAt: 1,
  incrementBy: 1, 
  });

  supplierSchema.pre('save', function (next) {
    let doc = this;
    // Check if the document is new
    if (doc.isNew) {
      let b =(doc._id).toString().padStart(6, '0');
      doc._id = b ;
    }
    next();
  });

const Supplier = model("Supplier", supplierSchema);
// const Supplier = mongoose.model("Supplier", supplierSchema);
// RESET pId
// Supplier.resetCount(function(err, nextCount) {
//   console.log('Auto-increment has been reset!'); 
// });
// const Supplier = model('Supplier', supplierSchema);
module.exports = Supplier;
