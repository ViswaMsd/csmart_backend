// imports
import {pool} from '../dbconnection.js'


///////////////////////////////////////////////////////////////
/////////////////////// UPDATE_FM_NAME ////////////////////////
///////////////////////////////////////////////////////////////
export async function update_fm_name(project_name, old_fm_name, new_fm_name) {
    let response
    let has_error = 0
    try {
        const update_fm_name__query = "update "+project_name+".fm_t set name = ? where name = ?"
        const update_fm_name__query_results = await pool.query(update_fm_name__query, [new_fm_name, old_fm_name])
        console.log("update_fm_name__query_results:", update_fm_name__query_results)
        if(update_fm_name__query_results[0].affectedRows === 0) {
            throw "provide fm is not present"
        }    
    } 
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while updating the fm name")
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
   console.log("response:", response)
    return response
}


////////////////////////////////////////////////////////////
///////////////////// UPDATE_OP_NAME ///////////////////////
////////////////////////////////////////////////////////////
export async function update_op_name(project_name, old_op_name, new_op_name) {
    let response
    let has_error = 0
    try {
        const update_fm_name__query = "update "+project_name+".op_t set op_name = ? where op_name = ?"
        const update_fm_name__query_results = await pool.query(update_fm_name__query, [new_op_name, old_op_name])
        console.log("update_fm_name__query_results:", update_fm_name__query_results)
        if(update_fm_name__query_results[0].affectedRows === 0) {
            throw "provide op is not present"
        }    
    } 
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while updating the op name")
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
   console.log("response:", response)
    return response    
}


///////////////////////////////////////////////////////////////
/////////////////////// UPDATE_OP_INFO ////////////////////////
///////////////////////////////////////////////////////////////
export async function update_op_info(project_name, req_json) {
 
    // variables & constant
    let has_error = 0
    let response
    let {fm_name, op_name, op_version, op_descr, op_input_info, op_output_info, op_version_comments} = req_json
    let connection 
    try {
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        await connection.beginTransaction()
        
        // check the no of versions present for this opcode
        const version_count__query = "select version from op_versions_t where op_name = ? order by version desc"
        const [version_count__query_results] = await pool.query(version_count__query, [op_name])
        console.log("version_count__query_results:", version_count__query_results)
        if(version_count__query_results[0].version !== op_version) {
            throw "only latest version of the opcode can be updated.(currently) "
        }
        if(version_count__query_results.length > 1) {
            // calling delete_version_op followed by create_new_version_op
        }
        else {
            // calling delete_op followed by create_new_op
        }
    } 
    catch(err) {
        has_error = 1
        console.error("ERROR :: error while updating the opcode info")
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

    return response
}

