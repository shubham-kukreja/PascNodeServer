var passport = require("passport");
var user = require("../models/user");
var { options } = require("../config/config");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userid, done) => {
  user.findById(userid).then(user => {
    done(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: options.googleAuth.id,
    clientSecret: options.googleAuth.secret,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    user.findOne({ googleid: profile.id })
        .then((euser) => {
            if (euser) {
                console.log('User Already exists');
               done(null, euser);
            } else {
                new user({
                        username: profile.displayName,
                        firstname: profile._json.given_name,
                        lastname: profile._json.family_name,
                        googleid: profile.id,
                        email: profile._json.email
                    }).save()
                    .then((newUser) => {
                        console.log('User has been saved' + newUser);
                        done(null, newUser);
                    })
            }
        })
}))
