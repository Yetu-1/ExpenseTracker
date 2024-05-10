import express from "express"
const router = express.Router();
import isAuth from "../isAuth.js";

router.get("/", (req, res) => {
    res.render("login.ejs");
});

router.get("/home", (req, res) => {
    res.send("done");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});


router.get("/account", isAuth, (req, res) => {
    res.json(req.user);
});

router.get("/home", (req, res) => {
    console.log("here");
    if(req.isAuthenticated()) {
      console.log(req.user);
      res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
      //res.send(mailBody)
    }
}); 

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.get("/api", (req, res) => {
    if(req.isAuthenticated()) {
      // testRefreshToken();
      res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
    }
});

export default router;