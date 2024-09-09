import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv"
import {createUser} from "./dbQueries.js"


// Loads .env file contents into process.env so we can have access to the variables
env.config();

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
    async (accessToken, refreshToken, profile, cb) => {
      // Create new user and store user data in database 
      const response = await createUser(profile, accessToken);
      // return user object and store in session if successful or return error msg if unsuccessful 
      if(response.firstname){ // if a user object was returned
        const user = response;
        return cb(null, user);
      } else {
        return cb(response); // if an error occurred (response = err)
      }
    }
  )
);
  
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
  