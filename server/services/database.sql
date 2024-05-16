--create transactions table
CREATE TABLE transactions (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	account VARCHAR(15),
	amount VARCHAR(15),
	type VARCHAR(7),
	time VARCHAR(20),
	description TEXT,
	remarks TEXT
)

-- SELECT LAST 10 TRANSACTIONS
SELECT amount , type, description, day, month, year, time FROM transactions WHERE user_id=25
ORDER BY id DESC
FETCH FIRST 10 ROWS ONLY;