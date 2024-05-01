import bodyParser from "body-parser";
import express from "express"
import pg from "pg"
import env from "dotenv"
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import { getLatestMessage, listOfLabels } from "./services/emailparser.js";

// global scope variables
let userProfile = {};

// Loads .env file contents into process.env so we can have access to the variables
env.config();

const app = new express();
const port = 3000;

// Session Initialization
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login.ejs");
});

// Logout Route to log out user
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Logout Route to log out user
app.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Route from Login/Sign up button
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", 'https://www.googleapis.com/auth/gmail.readonly'],
  })
);

// redirect route from the passport authenticattion
app.get(
  "/auth/google/home",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

app.get("/home", (req, res) => {
  if(req.isAuthenticated()) {
    // res.render("home.ejs", {fName: userProfile.family_name, lName: userProfile.given_name, img: userProfile._json.picture});
    res.send(mailBody)
  }
});

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/home",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
    async (accessToken, refreshToken, profile, cb) => {
      //await listOfLabels(accessToken);
      await getLatestMessage(accessToken);
      userProfile = profile;
      try {
        // Check if user already exists in the database
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);

        const user = result.rows[0];

        if (result.rows.length === 0) {
          // if user does not exist add new user to database
          const rep = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          const newUser = rep.rows[0];

          return cb(null, newUser);
        } else {
          return cb(null, user);
        }
      } catch (err) {
        return cb(err);
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

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
});