import express from "express"
import passport from "passport";
import { getUserByEmail } from "../services/dbQueries.js";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import env from "dotenv"
import jwt from "jsonwebtoken";

const authRouter = express.Router();

authRouter.use(bodyParser.json());
//authRouter.use(bodyParser.urlencoded({ extended: true }));
env.config();
// global scope variables
const saltRounds = 10;
let hashedPassword = '';
let access_token = '';

// Logout Route to log out user
authRouter.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Route from Login/Sign up button
authRouter.get(
    "/google",
    passport.authenticate("google", {
      accessType: "offline", // Ensure that Google provides a refresh token
      scope: ["profile", "email", 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    })
);

// redirect route from the passport authenticattion
authRouter.get(
  "/google/home",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

// authRouter.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/home",
//     failureRedirect: "/register",
//   })
// );


authRouter.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    // Check if user already Exists
    const rep = await getUserByEmail(email);
    // If user exists redirect user to the login page
    if (rep.rows.length > 0) {
      res.redirect("/login");
    } else {
      // Hash the input password
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          hashedPassword = hash;
          res.redirect("/auth/google");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

authRouter.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password);
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
          res.json({msg: 'Error comparing passwords' })
        } else {
          if (valid) {
            console.log("User successfully logged in!");
            const accessToken = generateAccessToken(user.jwt);
            const user_data = {
              id: user.id,
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              accessToken: accessToken,
              picture: user.picture
            }
            
            res.json({user: user_data});
          } else {
            console.log("Incorrect password!")
            res.json({msg: "Incorrect password!"})
          }
        }
      });
    } else {
      // User not found
      res.json({msg: 'User not found' })
    }
  } catch (err) {
    console.log(err);
  }
});

function generateAccessToken(refresh_token) {
  if(refresh_token == null) {return res.sendStatus(401)}
  // TODO: CHECK IF REFRESH TOKEN IS STILL VALID (i.e if it is still in the valid_tokens table in the database)

  jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if(err) return res.sendStatus(403);
      // Generate access token that lasts for 24hrs
      access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h'});
  })
  return access_token;
}


export {authRouter, hashedPassword};