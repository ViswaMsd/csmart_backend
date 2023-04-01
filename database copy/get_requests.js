// imports
import {pool} from '../dbconnection.js'
import { validate_token } from './auth_requests.js'
import * as error_codes from '../error_codes.js'
import { err_log_json, err_log_msg } from '../utils.js'


//////////////////////////////////////////////////////////////
//////////////////// GET_PROJETCS ////////////////////////////
////////////////////////////////////////////////////////////// 
export async function get_projects(req_header, req_body, req_params) {
    console.log ("hi")
    // variables & constants
    let response
    let results = []
    let has_error = 0
    console.log ("hi1")

    try {

        // token validation
        const user_id = await validate_token (req_header.token)
        err_log_msg(3, "user: " + user_id)

        // querying for user projects
        const user_projects_query = "select project_name from users_projects_t where user_id = ?"
        err_log_msg(3, "user_projects_query:" + user_projects_query)
        const [user_projects_query__results] = await pool.query(user_projects_query, [user_id])
        err_log_json(3, "user_projects_query__results:", user_projects_query__results)
        console.log ("user_projects_query__results:")
        // building the results array
        user_projects_query__results.forEach(({project_name}) => {
            results.push(project_name)
        })
    }
    catch (err) {
        has_error = 1
        err_log_json(1, "error in get_projects()", err)

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

    // success response
    if (has_error === 0)
        response = {
            "message": "success",
            "error_code": 0,
            "results": results
    }
    return response
}


/////////////////////////////////////////////////////////
///////////////// GET_FM_OPS_INFO ///////////////////////
/////////////////////////////////////////////////////////
export async function get_fm_ops_info(req_header, req_body, req_params) {

    // variables & constants
    let has_error = 0
    let results = []
    let name
    let response
    const project_name = req_params.project_name

    // fetching info from DB
    try {

        // token validation
        const user_id = await validate_token (req_header.token)

        const fm_query = "select name from "+project_name+"_fm_t order by name"
        err_log_msg(3, "fm_query :" + fm_query)
        const [fm_info] = await pool.query(fm_query)
        err_log_json(3, "fm_info:", fm_info)
        for (let i = 0; i < fm_info.length; i++) {
            name = fm_info[i].name
            const op_query = "select op_name from "+project_name+"_op_t where fm_name = ?"
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
        err_log_json(1, "error while fetching the fm-ops details from the database", err)
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


/////////////////////////////////////////////////////////////////////
/////////////////////////// GET_OP_INFO /////////////////////////////
///////////////////////////////////////////////////////////////////// 
export async function get_op_info(req_header, req_body, req_params) {

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
    const {project_name, op_name, version} = req_params
 
    // fetching info from DB
    try {

        // token validation
        const user_id = await validate_token (req_header.token)       

        // op_descr_info
        const descr_query = "select op_descr, latest_version from "+project_name+"_op_t where op_name = ?"
        err_log_msg(3, "descr_query:" + descr_query)
        const [results] = await pool.query(descr_query, [op_name])
        op_descr_info = results
        latest_version = op_descr_info[0].latest_version
        
        // op_input_info & op_output_info & op_version_comment_info
        if(version === 'latest') {
            res_version = latest_version
            const input_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_type, opift.fld_name, opift.fld_descr from "+project_name+"_op_t opt, "+project_name+"_op_input_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const output_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_type, opift.fld_name, opift.fld_descr from "+project_name+"_op_t opt, "+project_name+"_op_output_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const comment_query = "select opvt.comments from "+project_name+"_op_t opt, "+project_name+"_op_versions_t opvt where opt.op_name = opvt.op_name AND opt.latest_version = opvt.version AND opt.op_name = ?"
            err_log_msg(3, "input_query:" + input_query)
            err_log_msg(3, "output_query:" + output_query)
            err_log_msg(3, "comment_query:" + comment_query)
            const [results1] = await pool.query(input_query, [op_name])
            op_input_info = results1
            const [results2] = await pool.query(output_query, [op_name])
            op_output_info = results2
            const [results3] = await pool.query(comment_query, [op_name])
            op_version_comment_info = results3
            err_log_json(3, "input_query__results:", op_input_info)
            err_log_json(3, "output_query__results:", op_output_info)
            err_log_json(3, "comment_query__results:", op_version_comment_info)
        }
        else {

            // validating whether the given version of the opcode is present or not
            const op_version_validation__query = "select * from "+project_name+"_op_versions_t where op_name = ? and version = ?"
            err_log_msg(3, "op_version_validation__query:" + op_version_validation__query)
            const [op_version_validation__query_results] = await pool.query(op_version_validation__query, [op_name, version])
            err_log_json(3, "op_version_validation__query_results:", op_version_validation__query_results)
            if(op_version_validation__query_results.length === 0) {
                throw error_codes.INVALID_OP_OR_VERSION
            }

            res_version = version
            const input_query = "select manditory_optional, fld_lvl, fld_type, fld_name, fld_descr from "+project_name+"_op_input_flds_t where op_name = ? AND version = ?"
            const output_query = "select manditory_optional, fld_lvl, fld_type, fld_name, fld_descr from "+project_name+"_op_output_flds_t where op_name = ? AND version = ?"
            const comment_query = "select comments from "+project_name+"_op_versions_t where op_name = ? AND version = ?"
            err_log_msg(3, "input_query:" + input_query)
            err_log_msg(3, "output_query:" + output_query)
            err_log_msg(3, "comment_query:" + comment_query)
            const [results1] = await pool.query(input_query, [op_name, version])
            op_input_info = results1
            const [results2] = await pool.query(output_query, [op_name, version])
            op_output_info = results2
            const [results3] = await pool.query(comment_query, [op_name, version])
            op_version_comment_info = results3
            err_log_json(3, "input_query__results:", op_input_info)
            err_log_json(3, "output_query__results:", op_output_info)
            err_log_json(3, "comment_query__results:", op_version_comment_info)
        }

        // get the version history
        const op_version_history_info__query = "select distinct version from "+project_name+"_op_versions_t where op_name = ? order by version desc"
        err_log_msg(3, "op_version_history_info__query:" + op_version_history_info__query)
        const [results4] = await pool.query(op_version_history_info__query, [op_name])
        op_version_history_info__query_results = results4
        err_log_json(3, "op_version_history_info__query_results:", op_version_history_info__query_results)

    }

    // failure response
    catch (err){
        has_error = 1
        err_log_json(1, "error while fetching the opcode details from the database", err)
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
    } 
    return response
}