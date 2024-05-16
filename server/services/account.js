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

async function computeTransactions(user_id, type) {
    const date = new Date();
    let month = (date.getMonth()+1);

    const total_amounts = {
        day: '',
        month: '',
        year: '',
    }

    if(month < 10) {
        month = '0' + (date.getMonth()+1);
    }
    try{
        // Get total transactions for the day
        let response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND day=$2 AND type='${type}'`, [
            user_id, date.getDate(),
        ]);
        total_amounts.day = calculateTotal(response.rows);

        // Get total transactionfor the month
        response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND month=$2 AND type='${type}'`, [
            user_id, month,
        ]);
        total_amounts.month = calculateTotal(response.rows);

        // Get total transaction for the year
        response = await db.query(`SELECT amount FROM transactions WHERE user_id=$1 AND year=$2 AND type='${type}'`, [
            user_id, date.getFullYear(),
        ]);
        total_amounts.year = calculateTotal(response.rows);
    }catch(err) {
        console.log("Error calculating expenses!", err);
    }
    return total_amounts;
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


async function getCurrentBalance() {
    let balance = '';

    return balance;
}

async function getLastTransactions(user_id) {
    let transactions = [];
    // Get last 10 transactions
    const response = await db.query("SELECT amount , type, description, day, month, year, time FROM transactions WHERE user_id=$1 ORDER BY id DESC FETCH FIRST 10 ROWS ONLY;", [
        user_id,
    ]);
    transactions = response.rows;
    console.log(transactions);
    return transactions;
}

export {getTotalFinancials, getCurrentBalance, getLastTransactions}