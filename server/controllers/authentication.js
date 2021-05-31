const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const ExpertSignupToken = require('../models/expertsignuptoken');
const mailgun = require('../config/mailgun');
// const mailchimp = require('../config/mailchimp');
const setUserInfo = require('../helpers').setUserInfo;
const sendRegistrationEmail = require('../helpers').sendRegistrationEmail;
const sendExpertSignupTokenEmail = require('../helpers').sendExpertSignupTokenEmail;
const getRole = require('../helpers').getRole;
const config = require('../config/main');

const bcrypt      = require('bcrypt-nodejs');
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmailEmail,
    pass: config.gmailPassword,
  },
});

// Generate JWT
// TO-DO Add issuer and audience
function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 604800 // in seconds
  });
}

//= =======================================
// Login Route
//= =======================================
exports.login = function (req, res, next) {
  console.log('hell---');
  if(req.user.status === false){
    res.json({errorMessage:"Sorry You've Been Banned"})
  }else{
      const userInfo = setUserInfo(req.user);
      res.status(200).json({
        token: `JWT ${generateToken(userInfo)}`,
        user: userInfo
      });
  }
};


//= =======================================
// Logout Route
//= =======================================
exports.logout = function (req, res, next) {
    const userId = req.params.userId;

    if (!userId) { return res.status(401).json({ error: 'You are not authorized to view this user profile.' }); }
    User.findById(userId, (err, user) => {

        if (err) {
            res.status(400).json({ error: 'No user could be found for this ID.' });
            return next(err);
        }

        user.onlineStatus = "OFFLINE";
        user.save();

        return res.status(200).json({});
    });
};


exports.loginFacebookUser = function (req, res, next) {


  if(req.body.response){

      User.findOne({ 'email' : req.body.response.email }, function(err, user) {
          if (err)
              return done(err);


          if (user) {

            const userInfo = setUserInfo(user);
            //user.fbLoginAccessToken  = token;
            user.jwtLoginAccessToken = `JWT ${generateToken(userInfo)}`;
            user.loginSource       = 'Facebook';
            user.onlineStatus      = 'ONLINE';
            user.role              = 'User';
            user.save(function(err, doc) {
                console.log('** ** ** generateToken user : '+doc);
                //return done(null,doc);
                res.status(200).json({
                    token: `JWT ${generateToken(userInfo)}`,
                    user: {
                      _id : doc._id,
                      customerId : doc.email,
                      expertCategories : doc.expertCategories,
                      expertFocusExpertise : doc.expertFocusExpertise,
                      expertRates : doc.expertRates,
                      expertRating: doc.expertRating,
                      facebookURL: doc.facebookURL,
                      firstName: doc.profile.firstName,
                      lastName: doc.profile.lastName,
                      locationCity: doc.locationCity,
                      locationCountry: doc.locationCity,
                      profileImage: doc.profileImage,
                      email : doc.email,
                      slug : doc.slug,
                      profile : doc.profile,
                      gender : doc.gender,
                      userBio: doc.userBio,
                      role: 'User'
                    }
                  });
            });
              //return done(null, user); // user found, return that user
          } else {

              var unixTimeStamp         = Date.now();
              var newUser               = new User();
              var slug                  = req.body.response.email.substring(0, req.body.response.email.lastIndexOf("@"))+'-'+unixTimeStamp;
              newUser.email             = req.body.response.email;
              newUser.password          = "rvtech123#";
              newUser.profile.firstName = req.body.response.name;
              newUser.profile.lastName  = req.body.response.name;
              newUser.slug              = slug;
              newUser.userBio           = "Facebook User";
              newUser.loginSource       = 'Facebook';
              newUser.onlineStatus      = 'ONLINE';
              newUser.role              = 'User';
              newUser.profileImage = req.body.response.picture.data.url,
              newUser.save(function(err,doc) {
                if (err){
                      console.log('error occured while saving: '+err);
                      throw err;
                  }else{
                      console.log('data added');
                  }
                  // if successful, return the new user
                  const userInfo = setUserInfo(newUser);
                  //return done(null, newUser,`JWT ${generateToken(userInfo)}`);

                  res.status(200).json({
                    token: `JWT ${generateToken(userInfo)}`,
                    user: {
                      _id : doc._id,
                      customerId : "",
                      expertCategories : "",
                      expertFocusExpertise : "",
                      expertRates : "",
                      expertRating: "",
                      facebookURL: "",
                      firstName: req.body.response.name,
                      lastName: req.body.response.name,
                      locationCity: "",
                      locationCountry: "",
                      gender : "",
                      profileImage: req.body.response.picture.data.url,
                      email : req.body.response.email,
                      slug : slug,
                      role : newUser.role,
                      userBio: newUser.userBio,
                      profile : {
                        firstName : req.body.response.name,
                        lastName : req.body.response.name
                      },
                    }
                  });
              });
          }
      });
  }
};


//= =======================================
// Facebook Route
//= =======================================
exports.facebookSendJWTtoken = function (req, res, next) {

  if(req.body.token){
    User.findOne({ jwtLoginAccessToken : req.body.token }, (err, userInfo) => {
      if(userInfo){
        setUserInfo(userInfo);
        res.status(200).json({
          token: userInfo.jwtLoginAccessToken,
          user: userInfo
        });
      }else{
        res.status(200).json({
          token: "",
          user: ""
        });
      }
    });
  }else{
    res.status(200).json({
      token: "",
      user: ""
    });
  }
};

//= =======================================
// Twitter Route
//= =======================================
exports.twitterSendJWTtoken = function (req, res, next) {
  if(req.body.token){
    User.findOne({ jwtLoginAccessToken : req.body.token }, (err, userInfo) => {
      if(userInfo){
        setUserInfo(userInfo);
        res.status(200).json({
          token: userInfo.jwtLoginAccessToken,
          user: userInfo
        });
      }else{
        res.status(200).json({
          token: "",
          user: ""
        });
      }
    });
  }else{
    res.status(200).json({
      token: "",
      user: ""
    });
  }
};

//= =======================================
// Registration Route
//= =======================================
exports.register = function (req, res, next) {
  // Check for registration errors
  const email = req.body.email;
  // const firstName = req.body.firstName;
  const firstName = email.split('@')[0];
  const lastName = req.body.lastName;
  const password = req.body.password;
  const cfmPassword = req.body.cfmPassword;
  var slug = req.body.firstName+'-'+req.body.lastName;
  const role = "Expert";

  const expertSubCategories = 'new_category';

  if(!req.body.firstName){
    slug = email.split('@')[0];
  }


  // Return error if no email provided
  if (!email) {
    return res.json({ error: 'You must enter an email address.' });
  }

  // Return error if no password provided
  if (!password) {
    return res.json({ error: 'You must enter a password.' });
  }

  /*if ( password != cfmPassword) {
    return res.json({ error: 'Password and Confirm Password must be same!' });
  }*/


  User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }

    // If user is not unique, return error
    if (existingUser) {
      return res.json({ error: 'That email address is already in use.' });
    }

      // If email is unique and password was provided, create account
    const user = new User({
      email,
      password,
      profile: { firstName, lastName },
      slug,
      expertSubCategories,
      role
    });
    user.save((err, user) => {
      if (err) {
        return next(err);
      }
      
      if(user){
        console.log('now, send mail');
        sendRegistrationEmail(user);
      }

      // Subscribe member to Mailchimp list
      // mailchimp.subscribeToNewsletter(user.email);

      // Respond with JWT if user was created

      const userInfo = setUserInfo(user);

      res.json({
        success:true,
        token: `JWT ${generateToken(userInfo)}`,
        user: userInfo
      });
    });
  });
};

//= =======================================
// Authorization Middleware
//= =======================================

// Role authorization check
exports.roleAuthorization = function (requiredRole) {
  return function (req, res, next) {
    const user = req.user;

    User.findById(user._id, (err, foundUser) => {
      if (err) {
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (getRole(foundUser.role) >= getRole(requiredRole)) {
        return next();
      }

      return res.status(401).json({ error: 'You are not authorized to view this content.' });
    });
  };
};

//= =======================================
// Forgot Password Route
//= =======================================

exports.forgotPassword = function (req, res, next) {
  const email = req.body.email;

  User.findOne({ email }, (err, existingUser) => {
    // If user is not found, return error
    if (err || existingUser == null) {
      console.log('\nerr: '+err+'\n'+'existingUser: '+JSON.stringify(existingUser));
      res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
      return next(err);
    }

      // If user is found, generate and save resetToken

      // Generate a token with Crypto
    crypto.randomBytes(48, (err, buffer) => {

      const resetToken = buffer.toString('hex');
      if (err) { return next(err); }

      existingUser.resetPasswordToken = resetToken;
      existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      existingUser.save((err) => {
          // If error in saving token, return it
        if (err) { return next(err); }

        const message = {
          subject: 'Reset Password',
          // text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          //   'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          //   'http://'}${req.headers.host}/reset-password/${resetToken}\n\n` +
          //   `If you did not request this, please ignore this email and your password will remain unchanged.\n`

          text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            ''}${req.headers.origin}/reset-password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`

        };

        // Otherwise, send user email via Mailgun
        //mailgun.sendEmail(existingUser.email, message);

        // send mail with node mailer testing..
        // var html = `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        //     'http://'}${req.headers.host}/reset-password/${resetToken}\n\n` +
        //     `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

        var html = `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            ''}${req.headers.origin}/reset-password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

        var mailOptions = {
          from: "Donnies List <no-reply@donnieslist.com>",
          to: email,
          subject: "Reset Password",
          html: html
        };
        transporter.sendMail(mailOptions, function(error, response) {
          if(error){
            console.log(error);
          }else{
            console.log("password reset mail sent!");
            console.log(response);
          }
        });
        // send mail with node mailer testing..

        console.log('1st controller forgot password');
        return res.status(200).json({ message: 'Please check your email for the link to reset your password.' });
      });
    });
  });
};

//= =======================================
// Reset Password Route
//= =======================================

exports.verifyToken = function (req, res, next) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, resetUser) => {
    // If query returned no results, token expired or was invalid. Return error.
    if (!resetUser) {
      res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
    }

      // Otherwise, save new password and clear resetToken from database
    resetUser.password = req.body.password;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;

    resetUser.save((err) => {
      if (err) { return next(err); }

        // If password change saved successfully, alert user via email
      const message = {
        subject: 'Password Changed',
        text: 'You are receiving this email because you changed your password. \n\n' +
          'If you did not request this change, please contact us immediately.'
      };

        // Otherwise, send user email confirmation of password change via Mailgun
      mailgun.sendEmail(resetUser.email, message);

      return res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
    });
  });
};

//= =======================================
// Signup Expert Send Signup Link Route
//= =======================================
exports.signupExpertSendSignupLink = function (req, res, next) {
  // Check for registration errors
  const email = req.body.email;
  const expertemail = req.body.expertemail;
  // let emailtest1=new RegExp("@stanford.edu").test(email);
  // let emailtest2=new RegExp("@harvard.edu").test(email);
  // Return error if no email provided
  if (!email) {
    return res.json({ error: 'You must enter an email address.', email: email, expertemail: expertemail });
  }

  // if(!(emailtest1 || emailtest2)){
  //   return res.status(422).send({ error: 'Email Should start with @stanford.edu  or @harvard.edu' });
  // }

  // else if( !/.+@stanford\.edu/.test(email) || !/.+@harvard\.edu/.test(email) ){
  //   return res.json({error: 'Email should be of @stanford.edu OR @harvard.edu', email: email, expertemail: expertemail });
  // }

  User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }
      var resetToken = "";
      if (existingUser) {
        return res.json({ error: 'This email address is already in use.', email: email, expertemail: expertemail });
      }else{
        const buf = crypto.randomBytes(48);
        resetToken = buf.toString('hex');
        ExpertSignupToken.findOne({ email }, (err, existingUserSignupToken) => {
          if (existingUserSignupToken) {
            //sendExpertSignupTokenEmail(existingUserSignupToken);
            return res.json({ message:'Success: Email with signup link is sent to you!' });
          }else{
              //case new account
              const expertSignupToken = new ExpertSignupToken({
                email,
                token: resetToken,
                tokenExpires: Date.now() + 3600000 // 1 hour
              });
              expertSignupToken.save((err, user) => {
                if (err) {
                  return next(err);
                }
                if(user){
                  sendExpertSignupTokenEmail(user);
                }
                return res.json({ message:'Congrats! We have sent you link on your email. Please check your email.' });
              });
          }
        });
      }
  });
};


// change password
exports.changePassword = async function(req,res, next){
  console.log('change password controller');
  console.log(req.body);

  const  SALT_FACTOR = 5;

  var new_password = "";

  await bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(req.body.password, salt, null, (err, hash) => {
      if (err) return next(err);
      // console.log(hash);
      new_password = hash;
      // next();
    });
  });

  console.log('new pass');

  console.log(new_password);

  User.findOne({resetPasswordToken : req.body.resetToken}, function(err, user){
    if(err){
      console.log('err---');
      console.log(err);
    }else{
      console.log('user---');
      console.log(user);
      if(user){

       var updateuser = {};      
       updateuser['password'] = new_password;
       updateuser['resetPasswordToken'] = null;

       User.findOneAndUpdate({_id:user._id}, updateuser, {new:true}, function(err4, company_obj){
          if (err4) {
            console.log('error occured');
            console.log(err4);
            return next(err4);
          }else{
            console.log('updated successfully');
            console.log(company_obj);
            res.status(201).json({
              success: true,
              message: 'Password changed successfully!',
            }); 
          }
        })



      }else{
        res.status(201).json({
          success: true,
          message: 'Something went wrong!',
        }); 
      }
    }
  });
}
// change password