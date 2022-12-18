// imports
import {pool} from '../dbconnection.js'


////////////////////////////////////////////////////////////
/////////////////// CREATE_NEW_PROJECT /////////////////////
//////////////////////////////////////////////////////////// 
export async function create_new_project(project_name) {

    // variables & constant
    let has_error = 0
    let response
    const database_creation_query = "CREATE DATABASE "+project_name
    console.log ("database_creation_query:", database_creation_query)

    // try
    try {
        const results = await pool.query(database_creation_query)
    }

    // failure response (tested)
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while creating the new database")
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
    console.log(response)
    return response
}   


//////////////////////////////////////////////////////////////////
//////////////////////// CREATE_NEW_FM ///////////////////////////
//////////////////////////////////////////////////////////////////
export async function create_new_fm(project_name, fm_name) {

    // variables & constant
    let has_error = 0
    let response
    const fm_creation_query = "insert into "+project_name+".fm_t(name) values (?)"
    console.log ("fm_creation_query:", fm_creation_query)

    // try
    try {
        const results = await pool.query(fm_creation_query, [fm_name])
        console.log(results)
    }

    // failure response (tested)
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while creating the new FM")
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
    console.log(response)
    return response
}    


/////////////////////////////////////////////////////////////////
////////////////////// CREATE_NEW_OP ////////////////////////////
/////////////////////////////////////////////////////////////////
export async function create_new_op(project_name, req_json) {

    // variables & constant
    let has_error = 0
    let response
    let {fm_name, op_name, op_version, op_descr, op_input_info, op_output_info, op_version_comments} = req_json
    let connection

    // try
    try {
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        await connection.beginTransaction()

        // op_t
        const op_t__query = "insert into "+project_name+".op_t (op_name, fm_name, op_descr, latest_version) values (?,?,?,?)"
        console.log("op_t__query:", op_t__query)
        const op_t__query_results = await connection.query(op_t__query, [op_name, fm_name, op_descr, op_version])
        console.log("op_t__query_results:", op_t__query_results)
            
        // op_versions_t
        const op_versions_t__query = "insert into "+project_name+".op_versions_t (op_name, version, comments) values (?,?,?)"
        console.log("op_versions_t__query:", op_versions_t__query)
        const op_versions_t__query_results = await connection.query(op_versions_t__query, [op_name, op_version, op_version_comments])
        console.log("op_versions_t__query_results:", op_versions_t__query_results)
            
        // op_input_flds_t
        for (let i = 0; i < op_input_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_name, fld_descr} = op_input_info[i]
            const op_input_flds_t__query = "insert into "+project_name+".op_input_flds_t (sl_no, op_name, version, manditory_optional, fld_lvl, fld_name, fld_descr) values (?,?,?,?,?,?,?)"
            const op_input_flds_t__query_results = await connection.query(op_input_flds_t__query, [sl_no, op_name, op_version, manditory_optional, fld_lvl, fld_name, fld_descr])
            console.log("op_input_flds_t__query_results:", op_input_flds_t__query_results)
        }

        // op_output_flds_t
        for (let i = 0; i < op_output_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_name, fld_descr} = op_output_info[i]
            const op_output_flds_t__query = "insert into "+project_name+".op_output_flds_t (sl_no, op_name, version, manditory_optional, fld_lvl, fld_name, fld_descr) values (?,?,?,?,?,?,?)"
            const op_output_flds_t__query_results = await connection.query(op_output_flds_t__query, [sl_no, op_name, op_version, manditory_optional, fld_lvl, fld_name, fld_descr])
            console.log("op_output_flds_t__query_results:", op_output_flds_t__query_results)
        }

        // TRANSACTION COMMIT
        await connection.commit()             
    }

    // failure response (not tested)
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while creating the new OPCODE")
        console.error(err)

        // TRANSACTION ABORT
        await connection.rollback()
        response = {
            "message": err.sqlMessage,
            "error_code": err.errno
        }
    }
    finally {
        connection.release() 
    }

    // success response (not tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }   
    console.log(response)
    return response
}    


//////////////////////////////////////////////////////////////////////////
///////////////////////// CREATE_NEW_VERSION_OP //////////////////////////
//////////////////////////////////////////////////////////////////////////
export async function create_new_version_op(project_name, req_json) {

    // variables & constant
    let has_error = 0
    let response
    let {fm_name, op_name, op_version, op_descr, op_input_info, op_output_info, op_version_comments} = req_json
    let connection

    // try
    try {
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        await connection.beginTransaction()

        // op_t
        const op_t__query = "update "+project_name+".op_t set latest_version = ?, op_descr = ? where op_name = ?"
     //   const op_t__query = "insert into "+project_name+".op_t (op_name, fm_name, op_descr, latest_version) values (?,?,?,?)"
        console.log("op_t__query:", op_t__query)
        const op_t__query_results = await connection.query(op_t__query, [op_version, op_descr, op_name])
        console.log("op_t__query_results:", op_t__query_results)
            
        // op_versions_t
        const op_versions_t__query = "insert into "+project_name+".op_versions_t (op_name, version, comments) values (?,?,?)"
        console.log("op_versions_t__query:", op_versions_t__query)
        const op_versions_t__query_results = await connection.query(op_versions_t__query, [op_name, op_version, op_version_comments])
        console.log("op_versions_t__query_results:", op_versions_t__query_results)
            
        // op_input_flds_t
        for (let i = 0; i < op_input_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_name, fld_descr} = op_input_info[i]
            const op_input_flds_t__query = "insert into "+project_name+".op_input_flds_t (sl_no, op_name, version, manditory_optional, fld_lvl, fld_name, fld_descr) values (?,?,?,?,?,?,?)"
            const op_input_flds_t__query_results = await connection.query(op_input_flds_t__query, [sl_no, op_name, op_version, manditory_optional, fld_lvl, fld_name, fld_descr])
            console.log("op_input_flds_t__query_results:", op_input_flds_t__query_results)
        }

        // op_output_flds_t
        for (let i = 0; i < op_output_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_name, fld_descr} = op_output_info[i]
            const op_output_flds_t__query = "insert into "+project_name+".op_output_flds_t (sl_no, op_name, version, manditory_optional, fld_lvl, fld_name, fld_descr) values (?,?,?,?,?,?,?)"
            const op_output_flds_t__query_results = await connection.query(op_output_flds_t__query, [sl_no, op_name, op_version, manditory_optional, fld_lvl, fld_name, fld_descr])
            console.log("op_output_flds_t__query_results:", op_output_flds_t__query_results)
        }

        // TRANSACTION COMMIT
        await connection.commit()             
    }

    // failure response (not tested)
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while creating the new OPCODE")
        console.error(err)

        // TRANSACTION ABORT
        await connection.rollback()
        response = {
            "message": err.sqlMessage,
            "error_code": err.errno
        }
    }
    finally {
        connection.release() 
    }

    // success response (not tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }   
    console.log(response)
    return response
} 