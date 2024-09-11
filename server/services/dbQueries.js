import env from "dotenv"
import pg from "pg"
import jwt from "jsonwebtoken"

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
function connectToDB() {
    db.connect();
}

async function getUserByEmail(email) {
  const rep = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rep
}

async function createUser(profile, accessToken) {
  try {
      // Check if user already exists in the database
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        profile.email, 
      ]);

      let user = result.rows[0];
      let jwt_token = ""

      if (result.rows.length === 0) {
        // if user does not exist add new user to database
        let rep = await db.query(
          "INSERT INTO users (email, firstname, lastname, picture, refreshToken) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [profile.email, profile.given_name, profile.family_name, profile._json.picture, accessToken]
        );
        user = rep.rows[0];
        let user_mask = {email: user.email, id: user.id}
        // Generate jwt refresh token // NOTE: if the access token for google api is used to create a jwt it will be too large to form the authorizaiton header for client to server requests
        jwt_token = jwt.sign(user_mask, process.env.ACCESS_TOKEN_SECRET);
        // save refresh token in database
        rep = await db.query(
          "UPDATE users SET jwt = $1 WHERE id = $2 RETURNING *",[jwt_token, user.id]
        );
        user = rep.rows[0];
      }
      else {
        // if user exists change the accesstoken to the new one. TODO: change name from refreshtoken to accessToken
        await db.query(
          "UPDATE users SET refreshToken=$1 WHERE email=$2",
          [accessToken, profile.email]
        );
      }
      return {email: user.email, firstname: user.firstname, lastname: user.lastname, jwt: user.jwt}
    } catch (err) {
      return err;
    }
}

async function addTransToDb(user_id, transactions) {
  try {
      // Add each transactions to db
      transactions.forEach( async (transaction) => {
        await db.query(
          "INSERT INTO transactions (user_id, account, amount, type, time, day, month, year, description, remarks, balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [user_id, transaction.account, transaction.amount, transaction.type, transaction.time, transaction.day, 
            transaction.month, transaction.year, transaction.description, transaction.remarks, transaction.balance]
        );
      });
  } catch (err) {
    return err;
  }
};

async function getUserAccessToken(user_id) {
  try {
    const rep = await db.query("SELECT refreshtoken FROM users WHERE id = $1", [
      user_id,
    ]);
    return rep.rows[0].refreshtoken;
  } catch (err) {
    return err;
  } 
}
export {connectToDB, createUser, getUserByEmail, addTransToDb, getUserAccessToken};