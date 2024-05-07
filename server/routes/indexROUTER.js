import express from "express"
const router = express.Router();
// setup route for auth
router.get("/", (req, res) => {
    res.render("login.ejs");
});

export default router;