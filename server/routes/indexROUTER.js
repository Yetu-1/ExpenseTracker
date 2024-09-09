import express from "express"
const router = express.Router();
import bodyParser from "body-parser";
import jwt from "jsonwebtoken"

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.render("login.ejs");
});

router.get("/home", authenticate, (req, res) => {
    res.json({msg: 'user just made an authenticated call'});
});

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']
    // Bearer Token
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
        if(err) res.sendStatus(403);
        req.user = user;
        next();
    })
}

export default router;