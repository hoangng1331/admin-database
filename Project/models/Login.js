const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);
const loginSchema = new Schema(
   {employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: false },
    role: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "Offline",
      validate: {
        validator: (value) => {
          if (["Online", "Offline"].includes(value.toUpperCase())) {
            return true;
          }
          return false;
        },
        message: `Payment type: {VALUE} is invalid!`,
      },
    },
    active: {
      type: String,
      required: true,
      default: "Activated",
      validate: {
        validator: (value) => {
          if (["Activated", "Deactivated"].includes(value.toUpperCase())) {
            return true;
          }
          return false;
        },
        message: `Payment type: {VALUE} is invalid!`,
      },
    },
  },
  {
    versionKey: false,
  },
);
loginSchema.virtual("name", {
  ref: "Employee",
  localField: "employeeId",
  foreignField: "_id",
  justOne: true,
});
loginSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
loginSchema.set('toJSON', { virtuals: true });
const Login = model('Login', loginSchema);  
 
module.exports = Login;