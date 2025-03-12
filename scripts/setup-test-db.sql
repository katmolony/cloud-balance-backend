-- Log start of setup
DO $$
BEGIN
    RAISE NOTICE 'Starting test database setup...';
END $$;

-- Drop resources table first (due to foreign key dependency)
DROP TABLE IF EXISTS resources;

-- Then drop users table
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

-- Create the resources table with a foreign key to users
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DO $$
BEGIN
    RAISE NOTICE 'Resources table created successfully!';
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

-- Create the test database if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cloud_balance_test') THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE cloud_balance_test OWNER testuser');
        RAISE NOTICE 'Created new test database cloud_balance_test';
    ELSE
        RAISE NOTICE 'Test database already exists';
    END IF;
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cloud_balance_test TO testuser;

DO $$
BEGIN
    RAISE NOTICE 'Granted privileges to testuser';
    RAISE NOTICE 'Test database setup complete!';
END $$;

-- Switch to test database and create the users table
\c cloud_balance_test

-- Drop the users table if it exists
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

-- Drop alerts table first if it exists
DROP TABLE IF EXISTS alerts;

-- Create the alerts table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cost', 'security')),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DO $$
BEGIN
    RAISE NOTICE 'Alerts table created successfully!';
END $$;
