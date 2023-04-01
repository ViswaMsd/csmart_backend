import express from 'express'


import {get_projects, get_fm_ops_info, get_op_info} from './database copy/get_requests.js'
import {create_new_project, create_new_fm, create_new_op, create_new_version_op} from './database copy/post_requests.js'
import {delete_project, delete_fm, delete_op, delete_version_op} from './database copy/delete_requests.js'
import {update_fm_name, update_op_name, update_op_info} from './database/update_requests.js'
import { register_user, login } from './database copy/auth_requests.js'
import {err_log_json, err_log_msg, pretty_json} from './utils.js'
//import {test} from './test.js'

const app = express()
app.use(express.json())



///////////////////////////////////////////////////////////////
///////////////////////////// GET /////////////////////////////
///////////////////////////////////////////////////////////////
// success status code : 200
// failure status code : 404

app.get("/", (req, res) => {
    const error = test()
    console.log(error)
    res.send(error)
}) 

app.get("/get_projects", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params

    // call the function
    err_log_msg(3, "GET -> /get_projects")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)
    const response = await get_projects(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "GET -> /get_projects -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "GET -> /get_projects -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

app.get("/get_fm_ops_info/:project_name", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params

    // call the function
    err_log_msg(3, "GET -> /get_fm_ops_info")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params) 
    const response = await get_fm_ops_info(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "GET -> /get_fm_ops_info -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "GET -> /get_fm_ops_info -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

app.get("/get_op_info/:project_name/:op_name/:version", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params
    
    // call the function
    err_log_msg(3, "GET -> /get_op_info")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)    
    const response = await get_op_info(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) { 
        err_log_json(3, "GET -> /get_op_info -> RESPONSE:", response)       
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "GET -> /get_op_info -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

////////////////////////////////////////////////////////////////
///////////////////////////// POST /////////////////////////////
////////////////////////////////////////////////////////////////
// success status code : 200
// failure status code : 404

app.post("/create_new_project/:project_name", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params
        
    // call the function
    err_log_msg(3, "POST -> /create_new_project")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params) 
    const response = await create_new_project(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /create_new_project -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /create_new_project -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

app.post("/create_new_fm/:project_name/:fm_name", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params

    // call the function
    err_log_msg(3, "POST -> /create_new_fm")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)
    const response = await create_new_fm(req_header, req_body, req_params) 
    
    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /create_new_fm -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /create_new_fm -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

app.post("/create_new_op/:project_name/", async (req, res) => {

   // parse the request
   const req_header = req.headers
   const req_body = req.body
   const req_params = req.params

    // call the function
    err_log_msg(3, "POST -> /create_new_op")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)
    const response = await create_new_op(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /create_new_op -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /create_new_op -> RESPONSE:", response)
        res.status(404).send(response)
    }
})

app.post("/create_new_version_op/:project_name/", async (req, res) => {

    // parse the request
    const req_header = req.headers
    const req_body = req.body
    const req_params = req.params

    // call the function
    err_log_msg(3, "POST -> /create_new_version_op")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)
    const response = await create_new_op(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /create_new_version_op -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /create_new_version_op -> RESPONSE:", response)
        res.status(404).send(response)
    } 
})

//////////////////////////////////////////////////////////////////
//////////////////////////// DELETE //////////////////////////////
//////////////////////////////////////////////////////////////////

app.delete("/delete_project/:project_name", async (req, res) => {
    const project_name = req.params.project_name
    const response = await delete_project(project_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.delete("/delete_fm/:project_name/:fm_name", async (req, res) => {
    const project_name = req.params.project_name
    const fm_name = req.params.fm_name
    const response = await delete_fm(project_name, fm_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.delete("/delete_op/:project_name/:op_name", async (req, res) => {
    const project_name = req.params.project_name
    const op_name = req.params.op_name
    const response = await delete_op(project_name, op_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.delete("/delete_version_op/:project_name/:op_name/:version", async (req, res) => {
    const project_name = req.params.project_name
    const op_name = req.params.op_name
    const op_version = req.params.version
    const response = await delete_version_op(project_name, op_name, op_version)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

//////////////////////////////////////////////////////////////////
///////////////////////////// UPDATE /////////////////////////////
//////////////////////////////////////////////////////////////////

app.patch("/update_fm_name/:project_name/:old_fm_name/:new_fm_name", async (req, res) => {
    const project_name = req.params.project_name
    const old_fm_name = req.params.old_fm_name
    const new_fm_name = req.params.new_fm_name
    const response = await update_fm_name(project_name, old_fm_name, new_fm_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.patch("/update_op_name/:project_name/:old_op_name/:new_op_name", async (req, res) => {
    const project_name = req.params.project_name
    const old_op_name = req.params.old_op_name
    const new_op_name = req.params.new_op_name
    const response = await update_op_name(project_name, old_op_name, new_op_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.patch("/update_op_info/:project_name", async (req, res) => {
    const project_name = req.params.project_name
    const req_json = req.body
    const response = await update_op_info(project_name, req_json)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.patch("/update_op_descr/:project_name", async (req, res) => {
    const project_name = req.params.project_name
    const response = await update_op_info(project_name)
    if (response.error_code === 0) {
        res.status(200).send(response)
    }
    else {
        res.status(404).send(response)
    }
})


////////////////////////////////////////////////////////////////
///////////////////////////// AUTH /////////////////////////////
////////////////////////////////////////////////////////////////
app.post("/register", async (req, res) => {

   // parse the request
   const req_header = req.headers
   const req_body = req.body
   const req_params = req.params

    // call the function
    err_log_msg(3, "POST -> /register")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)
    const response = await register_user(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /register -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /register -> RESPONSE:", response)
        res.status(404).send(response)
    }        
})



app.get("/login", async (req, res) => {

   // parse the request
   const req_header = req.headers
   const req_body = req.body
   const req_params = req.params

    // call the function
    err_log_msg(3, "POST -> /login")
    err_log_json(3, "REQUEST -> HEADER", req_header)
    err_log_json(3, "REQUEST -> BODY", req_body)
    err_log_json(3, "REQUEST -> PARAMS", req_params)    
    const response = await login(req_header, req_body, req_params)

    // send the response back
    if (response.error_code === 0) {
        err_log_json(3, "POST -> /login -> RESPONSE:", response)
        res.status(201).send(response)
    }
    else {
        err_log_json(1, "POST -> /login -> RESPONSE:", response)
        res.status(404).send(response)
    }               
})
















app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("something broke!").end()
})

const port = 5000
//app.listen(port,'localhost', 10, () => {
//    console.log("server is running on port:",port)
//})

app.listen(port, () => {
    console.log("server is running on the port:", port)
})



