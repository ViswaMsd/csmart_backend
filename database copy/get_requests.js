// imports
import {pool} from '../dbconnection.js'


//////////////////////////////////////////////////////////////
//////////////////// GET_PROJETCS ////////////////////////////
////////////////////////////////////////////////////////////// 
export async function get_projects() {

    // variables & constants
    const [projects] = await pool.query("select project_name from projects_t")
    console.log(projects)
    let results = []

    // fetching info from DB
    projects.forEach(({project_name}) => {
            results.push(project_name)
    })

    // success response
    const response = {
        "message": "success",
        "error_code": 0,
        "results": results
    }
    return response
}


/////////////////////////////////////////////////////////
///////////////// GET_FM_OPS_INFO ///////////////////////
/////////////////////////////////////////////////////////
export async function get_fm_ops_info(project_name) {

    // variables & constants
    let has_error = 0
    let results = []
    let name
    let response

    // fetching info from DB
    try {
        const fm_query = "select name from "+project_name+"_fm_t order by name"
        const [fm_info] = await pool.query(fm_query)
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


/////////////////////////////////////////////////////////////////////
/////////////////////////// GET_OP_INFO /////////////////////////////
///////////////////////////////////////////////////////////////////// 
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
        const descr_query = "select op_descr, latest_version from "+project_name+"_op_t where op_name = ?"
        console.log(" -> ", descr_query)
        const [results] = await pool.query(descr_query, [op_name])
        op_descr_info = results
        latest_version = op_descr_info[0].latest_version
        
        // op_input_info & op_output_info & op_version_comment_info
        if(version === 'latest') {
            res_version = latest_version
            const input_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_type, opift.fld_name, opift.fld_descr from "+project_name+"_op_t opt, "+project_name+"_op_input_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const output_query = "select opift.manditory_optional, opift.fld_lvl, opift.fld_type, opift.fld_name, opift.fld_descr from "+project_name+"_op_t opt, "+project_name+"_op_output_flds_t opift where opt.op_name = opift.op_name AND opt.latest_version = opift.version AND opt.op_name = ?"
            const comment_query = "select opvt.comments from "+project_name+"_op_t opt, "+project_name+"_op_versions_t opvt where opt.op_name = opvt.op_name AND opt.latest_version = opvt.version AND opt.op_name = ?"
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
            const op_version_validation__query = "select * from "+project_name+"_op_versions_t where op_name = ? and version = ?"
            const [op_version_validation__query_results] = await pool.query(op_version_validation__query, [op_name, version])
            console.log("op_version_validation__query_results:", op_version_validation__query_results)
            if(op_version_validation__query_results.length === 0) {
                throw "given version of the opcode is not present"
            }

            res_version = version
            const input_query = "select manditory_optional, fld_lvl, fld_type, fld_name, fld_descr from "+project_name+"_op_input_flds_t where op_name = ? AND version = ?"
            const output_query = "select manditory_optional, fld_lvl, fld_type, fld_name, fld_descr from "+project_name+"_op_output_flds_t where op_name = ? AND version = ?"
            const comment_query = "select comments from "+project_name+"_op_versions_t where op_name = ? AND version = ?"
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
        const op_version_history_info__query = "select distinct version from "+project_name+"_op_versions_t where op_name = ? order by version desc"
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