import express from "express"
const router = express.Router();

router.get("/", (req, res) => {
    res.render("login.ejs");
});

router.get("/home", (req, res) => {
    res.send("done");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.get("/home", (req, res) => {
    console.log("here");
    if(req.isAuthenticated()) {
      console.log(req.user);
      res.json({fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
      //res.send(mailBody)
    }
}); 

export default router;