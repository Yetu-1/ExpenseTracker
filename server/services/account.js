import env from "dotenv"
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

async function getExpenses(user_id) {
    const date = new Date();
    let month = (date.getMonth()+1);
    const expenses = {
        day: '',
        month: '',
        year: '',
    }

    if(month < 10) {
        month = '0' + (date.getMonth()+1);
    }
    try{
        // Get expenses for the day
        let response = await db.query("SELECT amount FROM transactions WHERE user_id=$1 AND day=$2 AND type='Debit'", [
            user_id, date.getDate()
        ]);
        expenses.day = calculateExpense(response.rows);

        // Get expenses for the month
        response = await db.query("SELECT amount FROM transactions WHERE user_id=$1 AND month=$2 AND type='Debit'", [
            user_id, month,
        ]);
        expenses.month = calculateExpense(response.rows);

        // Get expenses for the year
        response = await db.query("SELECT amount FROM transactions WHERE user_id=$1 AND year=$2 AND type='Debit'", [
            user_id, date.getFullYear(),
        ]);
        expenses.year = calculateExpense(response.rows);
    }catch(err) {
        console.log("Error calculating expenses!", err);
    }
    console.log(expenses);
    return expenses;
}

function calculateExpense(amounts) {
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

async function getLastTransactions() {
    const transactions = [];

    const rep = await db.query("SELECT () FROM transactions WHERE day = $1", [
        email,
    ]);
    return transactions;
}

export {getExpenses, getCurrentBalance, getLastTransactions}