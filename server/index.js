import bodyParser from "body-parser";
import express from "express"
import env from "dotenv"
import passport from "passport";
import session from "express-session";
import { connectToDB } from "./services/dbQueries.js";
// import my local strategy and google strategy
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


app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
});