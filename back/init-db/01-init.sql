-- Table Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    -- IMPORTANT: En production, le mot de passe doit être haché (bcrypt)
    password_hash VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test Alice
INSERT INTO users (username, email, password_hash)
VALUES ('Alice', 'alice@test.com', 'password123') 
ON CONFLICT (email) DO NOTHING;