// imports
import {pool} from '../dbconnection.js'


////////////////////////////////////////////////////////////////
/////////////////////// DELETE_PROJECT /////////////////////////
//////////////////////////////////////////////////////////////// 
export async function delete_project(project_name) {

    // variables & constants
    let has_error = 0
    let response   
    const database_deletion_query = "DROP DATABASE "+project_name

    // try    
    try {
        const results = await pool.query(database_deletion_query)
    }

    // failure response (tested)
    catch(err) {
        has_error = 1
        console.error("ERROR :: error while deleting the database")
        console.error(err)
        response = {
            "message": err.sqlMessage,
            "error_code": err.errno
        }
    } 

    // success response (tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }             
    return response
} 


///////////////////////////////////////////////////////////////
///////////////////////// DELETE_FM ///////////////////////////
/////////////////////////////////////////////////////////////// 
export async function delete_fm(project_name, fm_name) {

    // variables & constants
    let has_error = 0
    let response   
    const fm_deletion_query = "DELETE from "+project_name+".fm_t where name = ?"
    console.log("fm_deletion_query:", fm_deletion_query)

    // try    
    try {
        const results = await pool.query(fm_deletion_query, [fm_name])
        console.log(results)
    }

    // failure response (tested)
    catch(err) {
        has_error = 1
        console.error("ERROR :: error while deleting the fm")
        console.error(err)
        response = {
            "message": err.sqlMessage,
            "error_code": err.errno
        }
    } 

    // success response (tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }             
    return response
} 


//////////////////////////////////////////////////////////////
//////////////////////// DELETE_OP ///////////////////////////
//////////////////////////////////////////////////////////////
export async function delete_op(project_name, op_name) {

    // variables & constants
    let has_error = 0
    let response   
    const op_deletion_query = "DELETE from "+project_name+".op_t where op_name = ?"
    console.log("op_deletion_query:", op_deletion_query)

    // try    
    try {
        const results = await pool.query(op_deletion_query, [op_name])
        console.log(results)
        if(results[0].affectedRows === 0) {
            throw "there is no opcode present in with that name"
        }
    }

    // failure response (tested)
    catch(err) {
        has_error = 1
        console.error("ERROR :: error while deleting the OPCODE")
        console.error(err)
        if (!err.errno) {
            response = {
                "message": err,
                "error_code": 1
            }
        }
        else {
            response = {
                "message": err.sqlMessage,
                "error_code": err.errno
            }
        }    
    } 

    // success response (tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }             
    return response
} 


/////////////////////////////////////////////////////////////////
////////////////////// DELETE_VERSION_OP ////////////////////////
/////////////////////////////////////////////////////////////////
export async function delete_version_op(project_name, op_name, op_version) {

    // variables & constants
    let has_error = 0
    let response   
    let connection

    // try    
    try {

        // fetching the opcode's version history to determine whether we are deleting the latest version or not
        const op_version_history_info__query = "select distinct version from "+project_name+".op_versions_t where op_name = ? order by version desc"
        const [op_version_history_info__query_results] = await pool.query(op_version_history_info__query, [op_name])
        console.log("op_version_history_info__query_results:", op_version_history_info__query_results)

        // opening a new connection
        connection = await pool.getConnection()
        
        // TRANSACTION OPEN
        await connection.beginTransaction()

        const op_version_deletion__query = "delete from "+project_name+".op_versions_t where op_name = ? and version = ?"
        const op_version_deletion__query_results = await connection.query(op_version_deletion__query, [op_name, op_version])

        // update the latest version for the given opcode if the given op_verion is the latest
        if(op_version_history_info__query_results.length === 1) {
            const op_t_deletion__query = "DELETE from "+project_name+".op_t where op_name = ?"
            const op_t_deletion__query_results = await connection.query(op_t_deletion__query, [op_name])
        }
        else if (op_version_history_info__query_results[0].version === op_version) {   //------------------------> Not Tested
            const update_latest_version__query = "update "+project_name+".op_t set latest_version = ? where op_name = ?"
            const update_latest_version__query_results = await connection.query(update_latest_version__query, [op_version_history_info__query_results[1].version, op_name])
        }

        // TRANSACTION COMMIT
        await connection.commit()

        if(op_version_deletion__query_results[0].affectedRows === 0) {
            throw "there is no opcode present in with that name & version"
        }
    }

    // failure response (tested)
    catch(err) {
        has_error = 1
        console.error("ERROR :: error while deleting the version OPCODE")
        console.error(err)

        // TRANSACTION ABORT
        await connection.rollback()

        if (!err.errno) {
            response = {
                "message": err,
                "error_code": 1
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
        connection.release() 
    }     

    // success response (tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }             
    return response
} 