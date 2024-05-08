import express from "express"
const router = express.Router();

router.get("/", (req, res) => {
    res.send("hi auth");
});

export default router;