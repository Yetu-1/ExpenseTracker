import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv"
import {db} from "./dbQueries.js"
import { getLatestMessage, listOfLabels, testRefreshToken} from "./emailparser.js";
import {createUser, getUserByEmail} from "./dbQueries.js"
import bcrypt from "bcrypt";
// Loads .env file contents into process.env so we can have access to the variables
env.config();

passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/auth/google/home",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
      async (accessToken, refreshToken, profile, cb) => {
        //await listOfLabels(accessToken);
        console.log(refreshToken);
        await getLatestMessage(accessToken);
        // return user object and store in session if successful or return error msg if unsuccessful 
        const response = await createUser(profile, refreshToken, hashedPassword);
        if(response.email){ // if a user object was returned
          const user = response;
          return cb(null, user);
        } else {
          return cb(response); // if an error occurred (response = err)
        }
      }
    )
  );

  passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {    
      try {
        // Get user data with input email
        const result =  await getUserByEmail(username);
        // If user is found
        if (result.rows.length > 0) {
          const user = result.rows[0];
          // Get user stored hashed password
          const storedHashedPassword = user.password;
          // Compare stored hased password with input password
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                console.log("User successfully logged in!");
                return cb(null, user);
              } else {
                console.log("Incorrect password!")
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
  