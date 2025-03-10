DO $$ 
BEGIN
    RAISE NOTICE 'Starting test database setup...';
END $$;

-- Create test user if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'testuser') THEN
        CREATE ROLE testuser WITH LOGIN PASSWORD 'testpassword';
        ALTER ROLE testuser CREATEDB;
        RAISE NOTICE 'Created testuser role';
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
END $$;

-- Drop the test database if it exists
DROP DATABASE IF EXISTS cloud_balance_test;

DO $$ 
BEGIN
    RAISE NOTICE 'Dropped existing test database';
END $$;

-- Create test database
CREATE DATABASE cloud_balance_test OWNER testuser;

DO $$ 
BEGIN
    RAISE NOTICE 'Created new test database cloud_balance_test';
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cloud_balance_test TO testuser;

DO $$ 
BEGIN
    RAISE NOTICE 'Granted privileges to testuser';
    RAISE NOTICE 'Test database setup complete!';
END $$;

-- Drop the users table if it exists (for fresh test runs)
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    RAISE NOTICE 'Users table created successfully!';
END $$;
