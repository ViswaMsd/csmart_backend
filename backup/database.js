// imports
import mysql from 'mysql2'

// connections
const pool = mysql.createPool(
    {
        host: 'localhost',
        user: 'csmart_user',
        password: 'csmart_pass',
        database: 'csmart_project'
    }
).promise()



//const [results] = await pool.query("show databases")
//console.log(results)

// ----------------------------- GET -----------------------------//

// get_projects 
export async function get_projects() {

    // variables & constants
    const [databases] = await pool.query("show databases")
    let results = []

    // fetching info from DB
    databases.forEach(({Database}) => {
        if (Database === "sys" || Database === "information_schema" || Database === "mysql" || Database === "performance_schema") {
            console.log(Database, "is not qualified. so skipping")
        }
        else {
            results.push(Database)
        }
    })

    // success response
    const response = {
        "message": "success",
        "error_code": 0,
        "results": results
    }
    return response
}


// get_fm_ops_info
export async function get_fm_ops_info(project_name) {

    // variables & constants
    let has_error = 0
    let results = []
    let name
    let response

    // fetching info from DB
    try {
        const fm_query = "select name from "+project_name+".fm_t order by name"
        const [fm_info] = await pool.query(fm_query)
        for (let i = 0; i < fm_info.length; i++) {
            name = fm_info[i].name
            const op_query = "select op_name from "+project_name+".op_t where fm_name = ?"
            const [op_info] =  await pool.query(op_query, [name])
            var op_array = []
            op_info.forEach(({op_name}) => {
                op_array.push(op_name)
            })
            results.push({ "fm_name": name, "op_list": op_array })
        }
    }

    // failure response
    catch (err) {
        has_error = 1
        console.error("ERROR :: error while fetching the fm-ops details from the database")
        console.error(err)
        response = {
            "message": err.sqlMessage,
            "error_code": err.errno
        }        
    }

    // success response
    if(has_error === 0) {        
        response = {
            "message": "success",
            "error_code": 0,
            "results": results
        }
    } 
    return response
}


// get_op_info 
export async function get_op_info(project_name, op_name, version) {
    console.log(" -> eneterd get_op_info") 

    // variables & constants declarations
    let op_input_info = []
    let op_output_info = []
    let op_version_comment_info = []
    let op_descr_info
    let has_error = 0
    let response
    let res_version
    let latest_version
    let op_version_history_info__query_results
 
    // fetching info from DB
    try {

        // op_descr_info
        const descr_query = "select op_descr, latest_version from "+project_name+".op_t where op_name = ?"
        console.log(" -> ", descr_query)
        const [results] = await pool.query(descr_query, [op_name])
        op_descr_info = results
        latest_version = op_descr_info[0].latest_version
        
        // op_input_info & op_output_info & op_version_comment_info
        if(version === 'latest') {
            res_version = latest_version
            const input_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_name, opift.fld_descr from "+project_name+".op_t opt, "+project_name+".op_input_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const output_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_name, opift.fld_descr from "+project_name+".op_t opt, "+project_name+".op_output_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const comment_query = "select opvt.comments from "+project_name+".op_t opt, "+project_name+".op_versions_t opvt where opt.op_name = opvt.op_name AND opt.latest_version = opvt.version AND opt.op_name = ?"
            console.log(" -> ", input_query)
            console.log(" -> ", output_query)
            console.log(" -> ", comment_query)
            const [results1] = await pool.query(input_query, [op_name])
            op_input_info = results1
            const [results2] = await pool.query(output_query, [op_name])
            op_output_info = results2
            const [results3] = await pool.query(comment_query, [op_name])
            op_version_comment_info = results3
            console.log("op_version_comment_info:", op_version_comment_info)
        }
        else {

            // validating whether the given version of the opcode is present or not
            const op_version_validation__query = "select * from "+project_name+".op_versions_t where op_name = ? and version = ?"
            const [op_version_validation__query_results] = await pool.query(op_version_validation__query, [op_name, version])
            console.log("op_version_validation__query_results:", op_version_validation__query_results)
            if(op_version_validation__query_results.length === 0) {
                throw "given version of the opcode is not present"
            }

            res_version = version
            const input_query = "select manditory_optional, fld_lvl, fld_name, fld_name, fld_descr from "+project_name+".op_input_flds_t where op_name = ? AND version = ?"
            const output_query = "select manditory_optional, fld_lvl, fld_name, fld_name, fld_descr from "+project_name+".op_output_flds_t where op_name = ? AND version = ?"
            const comment_query = "select comments from "+project_name+".op_versions_t where op_name = ? AND version = ?"
            console.log(" -> ", input_query)
            console.log(" -> ", output_query)
            console.log(" -> ", comment_query)
            const [results1] = await pool.query(input_query, [op_name, version])
            op_input_info = results1
            const [results2] = await pool.query(output_query, [op_name, version])
            op_output_info = results2
            const [results3] = await pool.query(comment_query, [op_name, version])
            op_version_comment_info = results3
            console.log("op_version_comment_info:", op_version_comment_info)
        }

        // get the version history
        const op_version_history_info__query = "select distinct version from "+project_name+".op_versions_t where op_name = ? order by version desc"
        const [results4] = await pool.query(op_version_history_info__query, [op_name])
        op_version_history_info__query_results = results4
        console.log("op_version_history_info__query_results:", op_version_history_info__query_results)

    }

    // failure response
    catch (err){
        has_error = 1
        console.error("ERROR :: error while fetching the fm-ops details from the database")
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
    if (has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0, 
            "results" : {
                "op_name": op_name, 
                "op_descr": op_descr_info[0].op_descr, 
                "op_version": res_version,
                "op_version_history": op_version_history_info__query_results,
                "op_input_info": op_input_info, 
                "op_output_info": op_output_info, 
                "op_version_comments": op_version_comment_info[0]?.comments
            }
        } 
        console.log(response)              
    } 

    return response
}


// --------------------------------- POST --------------------------------- //
// success status code : 201

// create_new_project 
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

// create_new_fm 
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

// create_new_op
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


// create_new_op
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

// --------------------------------- DELETE --------------------------------- //

// delete_project 
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

// delete_fm 
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

// delete_op
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


// delete_version_op
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


// ----------------------------------- UPDATE ----------------------------------- //

// update_fm_name
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

// update_op_name
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

// update_op_info
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
