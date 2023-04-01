// imports
import {pool} from '../dbconnection.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import * as error_codes from '../error_codes.js'
import { err_log_msg, err_log_json } from '../utils.js'

///////////////////////////////////////////////////////////////////
////////////////////////// register_user //////////////////////////
///////////////////////////////////////////////////////////////////
export async function register_user(req_header, req_body, req_params) {
    const {email, user_id, password, role, projects} = req_body
    let has_error = 0
    let response
    let values = []
    let connection
    try {

        // validating whether the values provided are empty
        if (!email) {
            throw error_codes.EMPTY_EMAIL
        }
        else if (!user_id) {
            throw error_codes.EMPTY_USER_ID
        }
        else if (!password) {
            throw error_codes.EMPTY_PASSWORD
        }
        else if (!role) {
            throw error_codes.EMPTY_ROLE
        }
        else if (projects.length === 0) {
            throw error_codes.NO_PROJECTS_PROVIDED
        }

        // validating whether the email provided is already taken or not
        const email_validate__query = "SELECT email from users_t where email = ?"
        const [email_validate__query_result] = await pool.query(email_validate__query, [email])
        err_log_json(3, "email_validate__query_result:", email_validate__query_result)
        if (email_validate__query_result.length > 0) {
            throw error_codes.IN_USE_EMAIL
        }

        // validating whether the user_id provided is already taken or not
        const user_id_validate__query = "SELECT user_id from users_t where user_id = ?"
        const [user_id_validate__query_results] = await pool.query(user_id_validate__query, [user_id])
        if (user_id_validate__query_results.length > 0) {
            throw error_codes.IN_USE_USER_ID
        }

        // encrypt the password provided
        const password_encrypted = await bcrypt.hash(password, 8)

        // creating a new connection
        err_log_msg(3, "Connection - OPEN")
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        err_log_msg(3, "Transaction - OPEN")
        await connection.beginTransaction()

        // store the user details in DB
        const register_user__query = "INSERT into users_t SET ?"
        const [register_user__query_results] = await connection.query(register_user__query, {
            user_id     : user_id,
            email       : email,
            password    : password_encrypted,
            role        : role
        })

        // store the user project details in DB
        projects.forEach((project_name) => {
            values.push([user_id, project_name])
        })
        const user_projects_query = "INSERT into users_projects_t VALUES ?"
        const user_projects_query__results = await connection.query(user_projects_query, [values])
        err_log_json(3, "user_projects_query__results:", user_projects_query__results)

        // TRANSACTION COMMIT
        err_log_msg(3, "Transaction - CLOSE")
        await connection.commit()

    } 
    catch (err) {
        // TRANSACTION ABORT
        if (connection) {
            err_log_msg(3, "Transaction - ABORT")
            await connection.rollback()
        }    

        has_error = 1
        err_log_json(3, "error while registering a new user", err)
        if (!err.errno) {
            response = {
                "message": err,
                "error_code": error_codes.error_codes_map.get(err)
            }
        }
        else {
            response = {
                "message": err.sqlMessage,
                "error_code": err.errno
            }
        }              
    }
    finally {
        if (connection) {
            err_log_msg(3, "Connection - CLOSE/RELEASE")
            connection.release()
        }     
    }
//------------------------------------------------------------------->(nodemailer) on success, need to send a mail to customer with the login credentials
    // success response
    if(!has_error) {        
        response = {
            "message": "success",
            "error_code": 0
        }
    } 
    return response    
}    


/////////////////////////////////////////////////////////////////////
//////////////////////////// login //////////////////////////////////
/////////////////////////////////////////////////////////////////////
export async function login(req_header, req_body, req_params) {
    const {user_id, password} = req_header
    let has_error
    let response
    let jwt_token
    
    try {

        // validating for null values in user_id & password
        if (!user_id) {
            throw error_codes.EMPTY_USER_ID
        }
        else if (!password) {
            throw error_codes.EMPTY_PASSWORD
        }        
        
        // validating the user_id
        const user_id_validate__query = "SELECT * from users_t where user_id = ?"
        var [user_id_validate__query_results] = await pool.query(user_id_validate__query, [user_id])
        err_log_json(3, "user_id_validate__query_results:", user_id_validate__query_results)
        if (user_id_validate__query_results.length === 0) {
            throw error_codes.INVALID_USER_ID
        }
        
        // validating password
        if (!await bcrypt.compare(password, user_id_validate__query_results[0].password)) {
            throw error_codes.INVALID_PASSWORD
        }

        // if everything is write till now, then we will generate a 
        // jsonwebtoken and return it in the response
        jwt_token = jwt.sign({user_id}, process.env.JWT_ENCRYPTION_KEY, {expiresIn: process.env.JWT_EXPIRES_IN})

    } catch (error) {
        has_error = 1
        err_log_json(3, "error while login", err)

        if (!err.errno) {
            response = {
                "message": err,
                "error_code": error_codes.error_codes_map.get(err)
            }
        }
        else {
            response = {
                "message": err.sqlMessage,
                "error_code": err.errno
            }
        }             
    }
 //   validate_token(jwt_token)
    // success response
    if(!has_error) {        
        response = {
            "message": "success",
            "error_code": 0,
            "role": user_id_validate__query_results[0].role,
            "jwt_token": jwt_token,
            "token_expires_in": process.env.JWT_EXPIRES_IN
        }
    } 
    return response      
} 


/////////////////////////////////////////////////////////////////////
////////////////////////// validate_token ///////////////////////////
/////////////////////////////////////////////////////////////////////
export async function validate_token(jwt_token) {
    err_log_msg(3, "token:" + jwt_token)
    const now = Math.floor(Date.now() / 1000)
    err_log_msg(3, "now:" + now)
    const decoded_jwt_token = jwt.decode(jwt_token)
    err_log_json(3, "decoded_jwt_token:", decoded_jwt_token)

    if (!decoded_jwt_token) {
        err_log_msg(1, "invalid authentication token provided")
        throw error_codes.AUTH_TOKEN_INVALID
    }
    else if (now > decoded_jwt_token.exp) {
        err_log_msg(1, "authentication token expired")
        throw error_codes.AUTH_TOKEN_EXPIRED
    }
    else {
        const user_validation_query = "select user_id from users_t where user_id = ?"
        const [user_validation_query__results] = await pool.query (user_validation_query, [decoded_jwt_token.user_id])
        err_log_json(3, "user_validation_query__results:", user_validation_query__results)
        if (user_validation_query__results.length === 0) {
             throw error_codes.AUTH_TOKEN_INVALID
        }
    }
    return decoded_jwt_token.user_id
} 