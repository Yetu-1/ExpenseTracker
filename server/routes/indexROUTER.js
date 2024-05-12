import express from "express"
const router = express.Router();
import bodyParser from "body-parser";
import { testRefreshToken } from "../services/emailparser.js";

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.render("home.ejs");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.get("/home", (req, res) => {
    console.log(req.user.refreshtoken);
    const refreshToken = req.user.refreshtoken;
    testRefreshToken(refreshToken)
    if(req.isAuthenticated()) {
      console.log(req.user);
      res.render("home.ejs",{fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
    }
}); 

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

export default router;