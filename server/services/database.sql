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