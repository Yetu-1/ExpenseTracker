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
function connectToDB() {
    db.connect();
}

async function createUser(profile, refreshToken) {
    try {
        // Check if user already exists in the database
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email, 
        ]);

        let user = result.rows[0];

        if (result.rows.length === 0) {
          // if user does not exist add new user to database
          const rep = await db.query(
            "INSERT INTO users (email, password, firstname, lastname, picture, refreshToken) VALUES ($1, $2, $3, $4, $5, $6)",
            [profile.email, "google", profile.given_name, profile.family_name, profile._json.picture, refreshToken]
          );
          user = rep.rows[0];
        }
        return user;
      } catch (err) {
        return err;
      }
}

export {connectToDB, createUser};