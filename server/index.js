import bodyParser from "body-parser";
import express from "express"
import env from "dotenv"
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import { getLatestMessage, listOfLabels, testRefreshToken} from "./services/emailparser.js";
import { connectToDB, createUser } from "./services/dbQueries.js";

// global scope variables

// Loads .env file contents into process.env so we can have access to the variables
env.config();

const app = new express();
const port = 4000;

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
// connect to database
connectToDB();

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
    accessType: "offline", // Ensure that Google provides a refresh token
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

app.get("/api", (req, res) => {
    testRefreshToken();
   //res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
});

app.get("/home", (req, res) => {
  if(req.isAuthenticated()) {
    console.log(req.user);
    res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
    //res.send(mailBody)
  }
});

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
      const response = await createUser(profile, refreshToken);
      if(response.email){ // if a user object was returned
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

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
});