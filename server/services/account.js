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

async function getExpenses() {
    const date = new Date();
    let month = (date.getMonth()+1);
    const expenses = {
        day: '',
        month: '',
        year: '',
    }
    console.log((date.getMonth()+1));
    console.log(date.getFullYear());
    if(month < 10) {
        month = '0' + (date.getMonth()+1);
    }
    const rep = await db.query("SELECT amount FROM transactions WHERE type='Debit' AND day=$1", [
        date.getDate(),
    ]);

    console.log(rep.rows);

    const rep_2 = await db.query("SELECT amount FROM transactions WHERE month = $1 AND type = 'Debit'", [
        month,
    ]);
    console.log(rep_2.rows);
    const rep_3 = await db.query("SELECT amount FROM transactions WHERE year = $1 AND type = 'Debit'", [
        date.getFullYear(),
    ]);
    console.log(rep_3.rows);
    return expenses;
}

async function getCurrentBalance() {
    const balance = '';

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