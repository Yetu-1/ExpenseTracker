import bodyParser from "body-parser";
import express from "express"
import env from "dotenv"
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import { getLatestMessage, listOfLabels, testRefreshToken} from "./services/emailparser.js";
import { connectToDB, createUser, getUserByEmail } from "./services/dbQueries.js";
import bcrypt from "bcrypt";
// import my google strategy
import "./services/auth.js"

// import routes
import userRouter from "./routes/indexROUTER.js"
import {authRouter} from "./routes/authROUTER.js"

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

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use("/", userRouter);

app.use("/auth", authRouter);


app.get("/api", (req, res) => {
  if(req.isAuthenticated()) {
    // testRefreshToken();
    res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
  }
});


app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
});