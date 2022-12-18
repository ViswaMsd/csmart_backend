// imports
import mysql from 'mysql2'
import dotenv from 'dotenv'

// dotenv
dotenv.config()

// connections
export const pool = mysql.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
).promise()