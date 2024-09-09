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

// Route from Login/Sign up button
authRouter.get(
    "/google",
    passport.authenticate("google", {
      // accessType: "offline", // Ensure that Google provides a refresh token
      scope: ["profile", "email", 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    })
);

// redirect route from the passport authen≈ticattion
authRouter.get(
  "/google/home",
  passport.authenticate("google", { failureRedirect: "/login",}), (req, res) => {
    console.log(req.user);
    const user = req.user;
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      //TODO: create jwt token and redirect to `http://your-frontend-url.com/dashboard?token=${token}`
      res.redirect(`${process.env.CLIENT_CALLBACK_URL}?firstname=${user.firstname}&lastname=${user.lastname}&token=${user.token}&jwt=${user.jwt}&email=${user.email}`);
    });
  }
);

export {authRouter};