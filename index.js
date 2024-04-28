import bodyParser from "body-parser";
import express from "express"
import pg from "pg"
import env from "dotenv"
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import { google } from "googleapis"


// Loads .env file contents into process.env
env.config();

// create a new postgres database client
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// connect to the postgres database
db.connect();

const app = new express();
const port = 3000;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
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
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
       },
      async (accessToken, refreshToken, profile, cb) => {
        await listOfLabels(accessToken);
        await getLatestMessage(accessToken);
        try {
          // Check if user already exists in the database
          const result = await db.query("SELECT * FROM users WHERE email = $1", [
            profile.email,
          ]);

          if (result.rows.length === 0) {
            // if user does not exist add 
            const newUser = await db.query(
              "INSERT INTO users (email, password) VALUES ($1, $2)",
              [profile.email, "google"]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
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