const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});


// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  if(!this.isModified('password'))return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password or email');
  }
  throw Error('incorrect password or email');
};

userSchema.methods.createPasswordResetToken = function(){  //doesnt need t be cryptographically strong
  const resetToken = crypto.randomBytes(32).toString('hex');
  this. passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken;
}

const User = mongoose.model('user', userSchema);

module.exports = User;