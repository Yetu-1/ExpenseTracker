import bodyParser from "body-parser";
import express from "express"
import pg from "pg"
import env from "dotenv"
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import { google } from "googleapis"

// TODO :
/**
 * display first name, surname user, and Image from gmail profile (console.log(req.user))
 */
// global scope variables
let mailBody ='';
let userProfile = {};

// Loads .env file contents into process.env so we can have access to the variables
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
  console.log(req.user);
  console.log(userProfile);
  if(req.isAuthenticated()) {
    res.render("home.ejs", {fName: userProfile.family_name, lName: userProfile.given_name, img: userProfile._json.picture});
  }
});

async function listOfLabels(accessToken) {

  try{ 
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
    const response = await gmail.users.labels.list({
      userId: "me",
    });
  
    const labels = response.data.labels;

    if(!labels || labels.length == 0){
      console.log("No labels were found!");
    }else {
      console.log("Labels: ");
      labels.forEach((label) => {
        console.log(`- ${label.name}`); 
      });
    }

  }catch(err) {
    console.log("Error fetching labels", err);
  }
}

async function getLatestMessage(accessToken){
  try{ 
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });
  
    let latestMessageId = response.data.messages[0].id;
    console.log("[MSG ID]: ", latestMessageId);

    try{
      const messageContent = await gmail.users.messages.get({
        userId: "me",
        id: latestMessageId,
      })

      const body = JSON.stringify(messageContent.data.payload.body.data);
      console.log("[MSG BASE64]", body);
      mailBody = new Buffer.from(body, 'base64').toString();
      console.log("[MSG]: ", mailBody);
      
    }catch(err){
      console.log("Error getting message by id!", err);
    }

  }catch(err) {
    console.log("Error fetching messages!", err);
  }
}

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
      await listOfLabels(accessToken);
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