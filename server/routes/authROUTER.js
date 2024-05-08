import express from "express"
const router = express.Router();
import passport from "passport";
import { getUserByEmail } from "../services/dbQueries.js";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";

// router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// global scope variables
const saltRounds = 10;
let hashedPassword = '';

// Logout Route to log out user
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Route from Login/Sign up button
router.get(
    "/google",
    passport.authenticate("google", {
      accessType: "offline", // Ensure that Google provides a refresh token
      scope: ["profile", "email", 'https://www.googleapis.com/auth/gmail.readonly'],
    })
);

// redirect route from the passport authenticattion
router.get(
  "/google/home",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/api",
    failureRedirect: "/register",
  })
);

router.post("/register", async (req, res) => {
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

export default router;