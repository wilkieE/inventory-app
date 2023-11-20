# Inventory App - Nuxt 3 and Prisma

This is an inventory application built with Nuxt 3 and Prisma, utilizing a PostgreSQL database. Follow these steps to set up and run the app on your local machine.

## Prerequisites

- Node.js installed
- PostgreSQL installed

## Installation

1. Clone the repository to your local machine.

2. Navigate to the cloned directory and install dependencies:
   `npm install `

3. Add a `.env` file with your PostgreSQL connection string, it should look something like `DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/inventory_db"`
   you will need to create the database and user specified here if they dont exist

## Database Setup

### Create PostgreSQL User and Database

1. Connect to PostgreSQL:
   `psql -U postgres`

2. Create a new user:
   `CREATE USER USER WITH PASSWORD 'PASSWORD';`

3. Create a new database:
   `CREATE DATABASE inventory_db;
`

4. Grant the user the necessary permissions:

- Connect to the database:
  `\c inventory_db`
  or
  `psql -U postgres -d inventory_db`

- Grant all privileges to the user:
  ```
  GRANT ALL PRIVILEGES ON SCHEMA public TO USER;
  ```

5. Exit the PostgreSQL CLI

## Running Migrations and Seeder

1. Generate the Prisma client:
   `npx prisma migrate dev
`

2. Reset the database and run the seeder:
   `npx prisma migrate reset
`

## Starting the Application

Run the development server:
`npm run dev
`

And you're done. Now, you can view the awesome inventory app in your browser!
