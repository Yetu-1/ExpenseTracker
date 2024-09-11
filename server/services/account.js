import env from "dotenv"
import { response } from "express";
import pg from "pg"

// Loads .env file contents into process.env so we can have access to the variables
env.config();

// create a new postgres database client
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// connect to the postgres database
db.connect();

async function getTotalFinancials(user_id) {
    const total_expenses = await computeTransactions(user_id, "Debit");
    const total_earnings = await computeTransactions(user_id, "Credit");

    return {total_expenses: total_expenses, total_earnings: total_earnings};
}
// type: the type of transaction (Debit or Credit).
async function computeTransactions(user_id, type, current_account) {
    let query_condition = "";
    // construct sql query condition to select the current account
    if(current_account != "All")
        query_condition = `AND account='${current_account}'`
    const date = new Date();
    let month = (date.getMonth()+1);

    const total_amounts = {
        day: '',
        month: '',
        year: '',
    }

    if(month < 10) {
        month = '0' + (month);
    }
    try{
        // Get total transactions for the day
        let response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND day=$2 AND type='${type}' ${query_condition}`, [
            user_id, date.getDate(),
        ]);
        total_amounts.day = calculateTotal(response.rows);

        // Get total transactionfor the month
        response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND month=$2 AND type='${type}' ${query_condition}`, [
            user_id, month,
        ]);
        total_amounts.month = calculateTotal(response.rows);

        // Get total transaction for the year
        response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND year=$2 AND type='${type}' ${query_condition}`, [
            user_id, date.getFullYear(),
        ]);
        total_amounts.year = calculateTotal(response.rows);
    }catch(err) {
        console.log("Error calculating expenses!", err);
    }
    return total_amounts;
}

async function computeMonthExpenses(user_id, current_account, month) {
    let query_condition = "";
    // construct sql query condition to select the current account
    if(current_account != "All")
        query_condition = `AND account='${current_account}'`

    if(month < 10) {
        month = '0' + (month);
    }

    let month_expense = 0;
    try{
        // Get total transactionfor the month
        let response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND month=$2 AND type='Debit' ${query_condition}`, [
            user_id, month,
        ]);
        month_expense = calculateTotal(response.rows);
    }catch(err) {
        console.log("Error calculating expenses!", err);
    }
    return month_expense;
}

async function computePercentExpIncrease(user_id, current_account, accounts) {
    const date = new Date();
    let month = (date.getMonth()+1);
    let percent_increase = 0;
    let curr_month_expenses = 0;
    let prev_month_expenses = 0;

    // if current account is all accounts, calculate the current total expenses for all accounts and prev expenses total for all accounts and find the percentage increase
    if(current_account == 'All') {
        for(let i = 0; i < accounts.length; i++) {
            curr_month_expenses += await computeMonthExpenses(user_id, accounts[i].account, month);
        }

        for(let i = 0; i < accounts.length; i++) {
            prev_month_expenses += await computeMonthExpenses(user_id, accounts[i].account, month-1);
        }

    }else { // percentage increase for single accounts
        // get the total expenses for the current and previous months and calculate the percentage increase in expenses compared to the month
        curr_month_expenses = await computeMonthExpenses(user_id, current_account, month);
        prev_month_expenses = await computeMonthExpenses(user_id, current_account, month-1);
    }
    console.log(curr_month_expenses);
    console.log(prev_month_expenses)
    percent_increase = ((curr_month_expenses-prev_month_expenses)/prev_month_expenses) * 100;
    if (percent_increase == Infinity) {
        return 0;
    }
    return percent_increase;
}

// get expenses for the last 7 days
async function getLast7DaysExpenses(user_id, current_account) {
    const date = new Date();
    let month = (date.getMonth()+1);
    let last_seven_days_expns = [];
    // compute total expenses for each day
    for( let i = date.getDate()-6; i <= date.getDate(); i++) {
        let total = await computeExpenses(user_id, i, current_account);
        last_seven_days_expns.push({day: i, amount: total})
    }
    // console.log(last_seven_days_expns)
    return last_seven_days_expns;
}

// type: the type of transaction (Debit or Credit).
async function computeExpenses(user_id, date_day, current_account) {
    let query_condition = "";
    // construct sql query condition to select the current account
    if(current_account != "All")
        query_condition = `AND account='${current_account}'`

    const date = new Date();
    let month = (date.getMonth()+1);

    let total_expenses = 0

    if(month < 10) {
        month = '0' + (date.getMonth()+1);
    }
    if(date_day < 10) {
        date_day = '0' + date_day;
    }
    try{
        // Get total transactions for the day
        let response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND day=$2 AND type='Debit' ${query_condition}`, [
            user_id, date_day,
        ]);
        total_expenses = calculateTotal(response.rows);

    }catch(err) {
        console.log("Error calculating expenses!", err);
    }
    return total_expenses;
}

function calculateTotal(amounts) {
    let total = 0;
    for(let i = 0; i < amounts.length; i++) {
        const raw_amt = amounts[i].amount;
        // Convert from e.g 'NGN 1,500.30' to 1500.3
        const amount = raw_amt.slice(3).replace(",", "");
        total += parseFloat(amount); 
    }
    return total;
}


async function getCurrentBalance(user_id, current_account) {
    let balance = 0;
    // Fetch current balance
    try {
        const response = await db.query("SELECT balance FROM transactions WHERE user_id=$1 AND account=$2 ORDER BY id DESC FETCH FIRST 1 ROWS ONLY;", [
            user_id, current_account
        ]);
        // console.log(response.rows[0]);
        balance = response.rows[0].balance;
        balance = parseFloat(balance.slice(3).replace(",", ""));
    }catch(err) {
        console.log("Error fetching current balance!", err);
    }
    return balance;
}

async function getLastTransactions(user_id) {
    let transactions = [];
    // fetch last 10 transactions
    try{
        const response = await db.query("SELECT amount , type, description, day, month, year, time FROM transactions WHERE user_id=$1 ORDER BY id DESC FETCH FIRST 10 ROWS ONLY;", [
            user_id,
        ]);
        transactions = response.rows;
        // console.log(transactions);
    }catch(err) {
        console.log("Error fetching last 10 transactions!", err);
    }
    return transactions;
}

async function getAccounts(user_id) {
    let accounts = [];
    // fetch last 10 transactions
    try{
        const response = await db.query("SELECT DISTINCT account FROM transactions WHERE user_id=$1", [
            user_id,
        ]);
        accounts = response.rows;
        // console.log(transactions);
    }catch(err) {
        console.log("Error fetching last 10 transactions!", err);
    }
    return accounts;    
}

export {getTotalFinancials, getCurrentBalance, getLastTransactions, computeMonthExpenses, getLast7DaysExpenses, getAccounts, computePercentExpIncrease}