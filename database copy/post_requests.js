// imports
import {pool} from '../dbconnection.js'
import { validate_token } from './auth_requests.js'
import * as error_codes from '../error_codes.js'
import { err_log_json, pretty_json } from '../utils.js'


////////////////////////////////////////////////////////////
/////////////////// CREATE_NEW_PROJECT /////////////////////
//////////////////////////////////////////////////////////// 
export async function create_new_project(req_header, req_body, req_params) {

    // variables & constant
    let has_error = 0
    let response
    let connection
    const project_name = req_params.project_name

    // try
    try {

        // token validation
        const user_id = await validate_token (req_header.token)

        // creating a new connection
        err_log_msg(3, "Connection - OPEN")
        connection = await pool.getConnection()
        
        // TRANSACTION OPEN
        err_log_msg(3, "Transaction - OPEN")
        await connection.beginTransaction()

        // insert into projects
        const projects_t__query = "insert into projects_t set ?"
        err_log_msg(3, "projects_t__query:" + projects_t__query)
        const [projects_t__query_results] = await connection.query(projects_t__query, {project_name: project_name})

        // creating project_fm_t
        const project_fm_t__query = "create table IF NOT EXISTS "+project_name+"_fm_t ("+
                                        "name VARCHAR(100) NOT NULL,"+
                                        "created_t TIMESTAMP NOT NULL DEFAULT NOW(),"+
                                        "PRIMARY KEY (name)"+
                                    ")"
        err_log_msg(3, "project_fm_t__query:" + project_fm_t__query)                            
        const project_fm_t__query_results = await connection.query(project_fm_t__query, [project_name])
        
        // creating project_op_t
        const project_op_t__query = "create table IF NOT EXISTS "+project_name+"_op_t ("+
                                        "op_name VARCHAR(100) NOT NULL,"+
                                        "fm_name VARCHAR(100) NOT NULL,"+
                                        "op_descr VARCHAR(4000),"+
                                        "latest_version VARCHAR(30),"+
                                        "PRIMARY KEY (op_name),"+
                                        "FOREIGN KEY (fm_name) REFERENCES "+project_name+"_fm_t (name) ON DELETE CASCADE ON UPDATE CASCADE"+
                                        ")"
        err_log_msg(3, "project_op_t__query:" + project_op_t__query)                            
        const project_op_t__query_results = await connection.query(project_op_t__query, [project_name])

        // creating project_op_versions_t
        const project_op_versions_t__query = "create table IF NOT EXISTS "+project_name+"_op_versions_t ("+
                                                "op_name VARCHAR(100) NOT NULL,"+
                                                "version VARCHAR(30) NOT NULL,"+
                                                "comments VARCHAR(2000) NOT NULL,"+
                                                "PRIMARY KEY (op_name, version),"+
                                                "FOREIGN KEY (op_name) REFERENCES "+project_name+"_op_t(op_name) ON DELETE CASCADE ON UPDATE CASCADE"+
                                            ")"
        err_log_msg(3, "project_op_versions_t__query:" + project_op_versions_t__query)                            
        const project_op_versions_t__query_results = await connection.query(project_op_versions_t__query, [project_name])
                                            
        // creating project_op_input_flds_t
        const project_op_input_flds_t__query = "create table IF NOT EXISTS "+project_name+"_op_input_flds_t ("+
                                                    "sl_no INTEGER NOT NULL,"+
                                                    "op_name VARCHAR(100) NOT NULL,"+
                                                    "version VARCHAR(30) NOT NULL,"+
                                                    "manditory_optional VARCHAR(30) NOT NULL,"+
                                                    "fld_lvl INTEGER NOT NULL,"+
                                                    "fld_type VARCHAR(10) NOT NULL,"+
                                                    "fld_name VARCHAR(50) NOT NULL,"+
                                                    "fld_descr VARCHAR(2000) NOT NULL,"+
                                                    "PRIMARY KEY (sl_no, op_name, version),"+
                                                    "FOREIGN KEY (op_name, version) REFERENCES "+project_name+"_op_versions_t(op_name, version) ON DELETE CASCADE ON UPDATE CASCADE"+
                                                ")"                                
        err_log_msg(3, "project_op_input_flds_t__query:", project_op_input_flds_t__query)                            
        const project_op_input_flds_t__query_results = await connection.query(project_op_input_flds_t__query, [project_name])

        // creating project_op_output_flds_t
        const project_op_output_flds_t__query = "create table IF NOT EXISTS "+project_name+"_op_output_flds_t ("+
                                                    "sl_no INTEGER NOT NULL,"+
                                                    "op_name VARCHAR(100) NOT NULL,"+
                                                    "version VARCHAR(30) NOT NULL,"+
                                                    "manditory_optional VARCHAR(30) NOT NULL,"+
                                                    "fld_lvl INTEGER NOT NULL,"+
                                                    "fld_type VARCHAR(10) NOT NULL,"+
                                                    "fld_name VARCHAR(50) NOT NULL,"+
                                                    "fld_descr VARCHAR(2000) NOT NULL,"+
                                                    "PRIMARY KEY (sl_no, op_name, version),"+
                                                    "FOREIGN KEY (op_name, version) REFERENCES "+project_name+"_op_versions_t(op_name, version) ON DELETE CASCADE ON UPDATE CASCADE"+
                                                ")"
        err_log_msg("project_op_output_flds_t__query:", project_op_output_flds_t__query)                            
        const project_op_output_flds_t__query_results = await connection.query(project_op_output_flds_t__query, [project_name])

        // TRANSACTION COMMIT
        err_log_msg(3, "Transaction - CLOSE")
        await connection.commit()

    }

    // failure response (tested)
    catch (err) {

        // TRANSACTION ABORT
        if (connection) {
            err_log_msg(3, "Transaction - ABORT")
            await connection.rollback()
        }  
        has_error = 1
        err_log_json(3, "error while creating the new project", err)

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
            err_log_msg("Connection - CLOSE/RELEASE")
            connection.release()
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


//////////////////////////////////////////////////////////////////
//////////////////////// CREATE_NEW_FM ///////////////////////////
//////////////////////////////////////////////////////////////////
export async function create_new_fm(req_header, req_body, req_params) {

    // variables & constant
    let {project_name, fm_name} = req_params
    let has_error = 0
    let response
    
    

    // try
    try {

        // token validation
        const user_id = await validate_token (req_header.token)

        // creating new fm
        const fm_creation_query = "insert into "+project_name+"_fm_t set ?"
        err_log_msg(3, "fm_creation_query:", fm_creation_query)
        const results = await pool.query(fm_creation_query, {name: fm_name})
        err_log_json(3, "fm_creation_query__results", results)
    }

    // failure response (tested)
    catch (err) {
        has_error = 1
        err_log_json(3, "error while creating the new FM", err)
 
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
////////////////////// CREATE_NEW_OP ////////////////////////////
/////////////////////////////////////////////////////////////////
export async function create_new_op(req_header, req_body, req_params) {

    // variables & constant
    let has_error = 0
    let response
    let {fm_name, op_name, op_version, op_descr, op_input_info, op_output_info, op_version_comments} = req_body
    let {project_name} = req_params
    let connection

    // try
    try {

        // token validation
        const user_id = await validate_token (req_header.token)

        // creating a new connection
        err_log_msg(3, "Connection - OPEN")
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        err_log_msg(3, "Transaction - OPEN")
        await connection.beginTransaction()

        // op_t
        const op_t__query = "insert into "+project_name+"_op_t set ?"
        err_log_msg(3, "op_t__query: " + op_t__query)
        const op_t__query_results = await connection.query(op_t__query, {
                                                                            op_name:        req_json.op_name, 
                                                                            fm_name:        req_json.fm_name, 
                                                                            op_descr:       req_json.op_descr, 
                                                                            latest_version: req_json.op_version
                                                                        }
        )
        err_log_json(3, "op_t__query_results:", op_t__query_results)
            
        // op_versions_t
        const op_versions_t__query = "insert into "+project_name+"_op_versions_t set ?"
        err_log_msg(3, "op_versions_t__query: " + op_versions_t__query)
        const op_versions_t__query_results = await connection.query(op_versions_t__query,   {
                                                                                                op_name:    req_json.op_name, 
                                                                                                version:    req_json.op_version, 
                                                                                                comments:   req_json.op_version_comments
                                                                                            }
        )
        err_log_json(3, "op_versions_t__query_results: ", op_versions_t__query_results)
            
        // op_input_flds_t
        for (let i = 0; i < op_input_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_type, fld_name, fld_descr} = op_input_info[i]
            const op_input_flds_t__query = "insert into "+project_name+"_op_input_flds_t set ?"
            err_log_msg(3, "op_input_flds_t__query: " + op_input_flds_t__query)
            const op_input_flds_t__query_results = await connection.query(op_input_flds_t__query,   {
                                                                                                        sl_no:              sl_no, 
                                                                                                        op_name:            op_name, 
                                                                                                        version:            op_version, 
                                                                                                        manditory_optional: manditory_optional, 
                                                                                                        fld_lvl:            fld_lvl, 
                                                                                                        fld_type:           fld_type, 
                                                                                                        fld_name:           fld_name, 
                                                                                                        fld_descr:          fld_descr
                                                                                                    }
            )
            err_log_json(3, "op_input_flds_t__query_results:", op_input_flds_t__query_results)
        }

        // op_output_flds_t
        for (let i = 0; i < op_output_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_type, fld_name, fld_descr} = op_output_info[i]
            const op_output_flds_t__query = "insert into "+project_name+"_op_output_flds_t set ?" 
            err_log_msg(3, "op_output_flds_t__query: " + op_output_flds_t__query)           
            const op_output_flds_t__query_results = await connection.query(op_output_flds_t__query, {
                                                                                                        sl_no:              sl_no,
                                                                                                        op_name:            op_name,
                                                                                                        version:            op_version,
                                                                                                        manditory_optional: manditory_optional,
                                                                                                        fld_lvl:            fld_lvl,
                                                                                                        fld_type:           fld_type,
                                                                                                        fld_name:           fld_name,
                                                                                                        fld_descr:          fld_descr
                                                                                                    } 
            )            
            err_log_json(3, "op_output_flds_t__query_results:", op_output_flds_t__query_results)
        }

        // TRANSACTION COMMIT
        err_log_msg(3, "Transaction - CLOSE")
        await connection.commit()             
    }

    // failure response (not tested)
    catch (err) {
        has_error = 1
        err_log_json(3, "error while creating the new OPCODE", err)

        // TRANSACTION ABORT
        if (connection) {
            err_log_msg(3, "Transaction - ABORT")
            await connection.rollback()
        }

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

    // success response (not tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }   
    return response
}    


//////////////////////////////////////////////////////////////////////////
///////////////////////// CREATE_NEW_VERSION_OP //////////////////////////
//////////////////////////////////////////////////////////////////////////
export async function create_new_version_op(req_header, req_body, req_params) {

    // variables & constant
    let has_error = 0
    let response
    let {fm_name, op_name, op_version, op_descr, op_input_info, op_output_info, op_version_comments} = req_body
    let {project_name} = req_params
    let connection

    // try
    try {

        // token validation
        const user_id = await validate_token (req_header.token)

        // creating a new connection
        err_log_msg(3, "Connection - OPEN")
        connection = await pool.getConnection()

        // TRANSACTION OPEN
        err_log_msg(3, "Transaction - OPEN")
        await connection.beginTransaction()

        // op_t
        const op_t__query = "update "+project_name+"_op_t set latest_version = ?, op_descr = ? where op_name = ?"
        err_log_msg(3, "op_t__query:" + op_t__query)
        const op_t__query_results = await connection.query(op_t__query, [op_version, op_descr, op_name])
        err_log_json(3, "op_t__query_results:", op_t__query_results)
            
        // op_versions_t
        const op_versions_t__query = "insert into "+project_name+"_op_versions_t set ?"
        err_log_msg("op_versions_t__query:" + op_versions_t__query)
        const op_versions_t__query_results = await connection.query(op_versions_t__query,   {
                                                                                                op_name:    op_name,
                                                                                                version:    op_version,
                                                                                                comments:   op_version_comments 
                                                                                            }
        )
        err_log_json(3, "op_versions_t__query_results:", op_versions_t__query_results)
            
        // op_input_flds_t
        for (let i = 0; i < op_input_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_type, fld_name, fld_descr} = op_input_info[i]
            const op_input_flds_t__query = "insert into "+project_name+"_op_input_flds_t set ?"
            const op_input_flds_t__query_results = await connection.query(op_input_flds_t__query,   {
                                                                                                        sl_no:              sl_no,
                                                                                                        op_name:            op_name,
                                                                                                        version:            op_version,
                                                                                                        manditory_optional: manditory_optional,
                                                                                                        fld_lvl:            fld_lvl,
                                                                                                        fld_type:           fld_type,
                                                                                                        fld_name:           fld_name,
                                                                                                        fld_descr:          fld_descr
            })
            err_log_json(3, "op_input_flds_t__query_results:", op_input_flds_t__query_results)
        }

        // op_output_flds_t
        for (let i = 0; i < op_output_info.length; i++) {
            const {sl_no, manditory_optional, fld_lvl, fld_type, fld_name, fld_descr} = op_output_info[i]
            const op_output_flds_t__query = "insert into "+project_name+"_op_output_flds_t set ?"
            const op_output_flds_t__query_results = await connection.query(op_output_flds_t__query, {
                                                                                                        sl_no:              sl_no,
                                                                                                        op_name:            op_name,
                                                                                                        version:            op_version,
                                                                                                        manditory_optional: manditory_optional,
                                                                                                        fld_lvl:            fld_lvl,
                                                                                                        fld_type:           fld_type,
                                                                                                        fld_name:           fld_name,
                                                                                                        fld_descr:          fld_descr
                                                                                                    }
            )
            err_log_json(3, "op_output_flds_t__query_results:", op_output_flds_t__query_results)
        }

        // TRANSACTION COMMIT
        err_log_msg(3, "Transaction - CLOSE")
        await connection.commit()             
    }

    // failure response (not tested)
    catch (err) {
        has_error = 1
        err_log_json(3, "error while creating the new OPCODE", err)

        // TRANSACTION ABORT
        err_log_msg(3, "Transaction - ABORT")
        await connection.rollback()

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
        err_log_msg(3, "Connection - CLOSE/RELEASE")
        connection.release() 
    }

    // success response (not tested)
    if(has_error === 0) {
        response = {
            "message": "success",
            "error_code": 0
        }
    }   
    return response
} 