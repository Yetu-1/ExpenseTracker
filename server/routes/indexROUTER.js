import express from "express"
const router = express.Router();
import bodyParser from "body-parser";
import { getLatestMsgs } from "../services/emailparser.js";
import { addTransToDb } from "../services/dbQueries.js";
import { getTotalFinancials, getLastTransactions, getCurrentBalance } from "../services/account.js";

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.render("login.ejs");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.get("/home", async (req, res) => {
    //console.log(req.user.refreshtoken);
    const refreshToken = req.user.refreshtoken;
    // get Latest messages and convert them into transaction objects
    // const transactions = await getLatestMsgs(refreshToken);
    // await addTransToDb(req.user, transactions);
    // const {total_expenses, total_earnings} = await getTotalFinancials(req.user.id);
    // console.log("TOTAL EXPENSES", total_expenses);
    // console.log("TOTAL EARNINGS", total_earnings);

    // const last_10_transactions = await getLastTransactions(req.user.id);
    // console.log("LAST 10 TRANSACTIONS: ")
    // console.log(last_10_transactions);
    // const balance = await getCurrentBalance(req.user.id);
    // console.log("CURRENT BALANCE: ", balance);

    if(req.isAuthenticated()) {
      //console.log(req.user);
      res.render("home.ejs", {user: req.user})
    //   res.render("home.ejs",{fName: req.user.firstname, lName: req.user.lastname, img: req.user.picture});
    }
}); 

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

export default router;