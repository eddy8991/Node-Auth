const User = require("../models/User");
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/email')
const crypto = require('crypto');
const catchAsync = require("../utils/catchAsync");
const { start } = require("repl");

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge
  });
};

// controller actions
exports.signup_get = (req, res) => {
  res.render('signup');
}

exports.login_get = (req, res) => {
  res.render('login');
}
exports.forgotPassword_get = (req,res) => {
  res.render('forgotPassword')
}
exports.showResetForm = async (req,res,next) =>{
  const user = await User.findOne({
    passwordResetToken:req.params.token,
    passwordResetExpires:{$gt:Date.now()}
  })
  if(!user) {
    return res.redirect('/forgotPassword')
  }
  res.render('resetPassword',{
    token:req.params.token
  })
}

exports.signup_post = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
})

exports.login_post = catchAsync(async (req, res) => {
  const { email, password } = req.body;
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });

})

exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

exports.forgotPassword = catchAsync(async(req,res,next) =>{
  //get user based on email
  const email = req.body.email

    const user = await User.findOne(email)
    if(!user){
      return res.redirect('/forgotPassword')
    }
    //generate random token
    const resetToken = user.createpasswordResetToken();
    await user.save({validateBeforeSave: false})
    //send it back as an email
    const resetUrl = `http://127.0.0.1:3000/resetPassword/${resetToken}`
    const message = `Forgot password? Click on the link to reset it ${resetUrl}. If not please ignore this email`
    await sendMail({
      email:user.email,
      subject:'This reset link expires in 10 minutes',
      message:'email sent'
    })
    res.status(200).json({
      status:'success',
      message:'Link sent to email'
    })
})


exports.resetPassword = catchAsync(async(req,res,next) =>{
  //get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires:{$gt:Date.now()}})

  //if token is still valid and user set new password
  if(!user) {
    return res.redirect('/forgotPassword');
  }
  user.password = req.body.password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save();
  //log user in and send jwt
  const token = createToken(user._id);
  res.status(200).json({
    status:'success',
    token
  });


})

