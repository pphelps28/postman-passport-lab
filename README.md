# Overview

This is a template to be used in conjunction with the provided lab. 

In it, we will be implementing a basic JWT authentication workflow, using Passport JS and the following strategy:

```javascript
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));
```

After cloning this repo, be sure to run an `npm install`
