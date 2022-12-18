import express from 'express'
//import {get_projects, get_fm_ops_info, get_op_info, create_new_project, create_new_fm, create_new_op, create_new_version_op, delete_project, delete_fm, delete_op, delete_version_op, update_fm_name, update_op_name, update_op_info} from './database.js'


import {get_projects, get_fm_ops_info, get_op_info} from './database copy/get_requests.js'
import {create_new_project, create_new_fm, create_new_op, create_new_version_op} from './database copy/post_requests.js'
import {delete_project, delete_fm, delete_op, delete_version_op} from './database copy/delete_requests.js'
import {update_fm_name, update_op_name, update_op_info} from './database/update_requests.js'

const app = express()
app.use(express.json())

// -------------------------- GET -------------------------- //
// success status code : 200
// failure status code : 404

app.get("/", (req, res) => {
    res.send("Successfully landed on the HomePage")
}) 

app.get("/get_projects", async (req, res) => {
    const response = await get_projects()
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.get("/get_fm_ops_info/:project_name", async (req, res) => {
    const project_name = req.params.project_name
    const response = await get_fm_ops_info(project_name)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.get("/get_op_info/:project_name/:op_name/:version", async (req, res) => {
    console.log(" -> GET: /get_op_info/:project_name/:op_name/?version")    
    const project_name = req.params.project_name
    const op_name = req.params.op_name
    const version = req.params.version
    const response = await get_op_info(project_name, op_name, version)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

// -------------------------- POST -------------------------- //
// success status code : 200
// failure status code : 404

app.post("/create_new_project/:project_name", async (req, res) => {
    const project_name = req.params.project_name
    const response = await create_new_project(project_name)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.post("/create_new_fm/:project_name/:fm_name", async (req, res) => {
    const project_name = req.params.project_name
    const fm_name = req.params.fm_name
    const response = await create_new_fm(project_name, fm_name)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.post("/create_new_op/:project_name/", async (req, res) => {
    const project_name = req.params.project_name
    const req_json = req.body
    const response = await create_new_op(project_name, req_json)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

app.post("/create_new_version_op/:project_name/", async (req, res) => {
    const project_name = req.params.project_name
    const req_json = req.body
    const response = await create_new_version_op(project_name, req_json)
    if (response.error_code === 0) {
        res.status(201).send(response)
    }
    else {
        res.status(404).send(response)
    }
})

// -------------------------- DELETE -------------------------- //

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

// -------------------------- UPDATE -------------------------- //

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



