import express from "express"
const router = express.Router();
import bodyParser from "body-parser";
import jwt from "jsonwebtoken"
import { getLatestMsgs } from "../services/emailparser.js";
import { addTransToDb, getUserAccessToken } from "../services/dbQueries.js";
import { getCurrentBalance, computeMonthExpenses, getLast7DaysExpenses, getAccounts, computePercentExpIncrease} from "../services/account.js";

router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

// router.get("/", authenticate, async (req, res) => {
//     let balance = 0;
//     let expenses_month = 0;
//     let last_expenses_7_days = 0;
//     let accounts = [];
//     if(req.user.id) {
//         const token = await getUserAccessToken(req.user.id);
//         accounts = await getAccounts(req.user.id);
//         // const transactions = await getLatestMsgs(token);
//         // await addTransToDb(req.user.id, transactions); // doesn't matter if transactions is an empty array cause nothing would be added to the array if so.
//         balance = await getCurrentBalance(req.user.id);
//         expenses_month = await computeTransactions(req.user.id, 'Debit');
//         last_expenses_7_days = await getLast7DaysExpenses(req.user.id);
//     }

//    res.json({balance: balance, expenses: expenses_month, last_expenses: last_expenses_7_days, accounts: accounts});
// });

router.post("/", authenticate, async (req, res) => {
    let balance = 0;
    let expenses_month = 0;
    let last_expenses_7_days = 0;
    let accounts = [];
    const current_account = req.body.current_account;
    let percent_exp_increase = 0;

    if(req.user.id) {
        const token = await getUserAccessToken(req.user.id);
        accounts = await getAccounts(req.user.id);
        // const transactions = await getLatestMsgs(token);
        // await addTransToDb(req.user.id, transactions); // doesn't matter if transactions is an empty array cause nothing would be added to the array if so.
        if(current_account == "All"){
            for(let i = 0; i < accounts.length; i++) {
                balance += await getCurrentBalance(req.user.id, accounts[i].account);
            }
        }else {
            balance = await getCurrentBalance(req.user.id, current_account);
        }
        expenses_month = await computeMonthExpenses(req.user.id, current_account, ( (new Date()).getMonth()+1 ));
        percent_exp_increase = await computePercentExpIncrease(req.user.id, current_account, accounts);
        last_expenses_7_days = await getLast7DaysExpenses(req.user.id, current_account);
    }

   res.json({balance: balance, expenses: expenses_month, last_expenses: last_expenses_7_days, accounts: accounts, current_account: current_account, percent_increase: percent_exp_increase});
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