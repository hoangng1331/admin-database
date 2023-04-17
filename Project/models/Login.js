const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);
const loginSchema = new Schema(
   { lastName: { type: String, required: true },
    firstName: { type: String, required: true },  
    role: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);
loginSchema.virtual('fullName').get(function () {
  return this.lastName + ' ' + this.firstName;
});
loginSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
loginSchema.set('toJSON', { virtuals: true });
loginSchema.plugin(autoIncrement.plugin, {
  model: "Login",
  field: "employeeId",
  startAt: 1,
  incrementBy: 1, 
  });

  loginSchema.pre('save', function (next) {
    let doc = this;
    // Check if the document is new
    if (doc.isNew) {
      let b =(doc.employeeId).toString().padStart(6, '0');
      doc.employeeId = b ;
    }
    next();
  });


  const Login = model('Login', loginSchema);  
  // RESET pId
  // Login.resetCount(function(err, nextCount) {
  //   console.log('Auto-increment has been reset!'); 
  // });
module.exports = Login;