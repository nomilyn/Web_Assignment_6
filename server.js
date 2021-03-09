/*********************************************************************************************
* WEB700 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Nomilyn Cayton      Student ID: 118 902 204     Date: March 15, 2021
*
* Online (Heroku) Link: https://desolate-savannah-64855.herokuapp.com 
*
*********************************************************************************************/

const serverData = require("./modules/serverDataModule.js");
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/htmlDemo", (req,res)=>{
    res.sendFile(path.join(__dirname, "/views/htmlDemo.html"));
});

app.get("/employees/add",(req, res) => {
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.get("/employees",(req,res) => {
    try {
        if(req.query.department) {
            serverData.getEmployeesByDepartment(parseInt(req.query.department)).then(empQueryData => {
                res.send(empQueryData);
            }).catch(Message => {
                res.status(404).send({ Message });    
            });
        }
        else {       
            serverData.getAllEmployees().then(empData => {
                res.send(empData);
            }).catch(Message => {
                res.status(404).send({ Message });
            });
        }
    }
    catch(e) {
        res.status(500).send({ Message: e.Message});
    }
}); 

app.post("/employees/add", async (req, res) => {
    try {
        await serverData.addEmployee(req.body);
        res.redirect("/employees");
    }
    catch (e) {
        res.status(500).send({ Message: e});
    }   
});

app.get("/departments",(req,res) => {
    try {
        serverData.getDepartments().then(deptData => {
            res.send(deptData);
        }).catch(Message => {
            res.status(404).send({ Message });
        });
    }
    catch(e) {
        res.status(500).send({ Message: e.Message});
    }
});

app.get("/managers",(req,res) => {
    try {
        serverData.getManagers().then(managers => {
            res.send(managers);
        }).catch(Message => {
            res.status(404).send({ Message });
        });
    }
    catch(e) {
        res.status(500).send({ Message: e.Message});
    }
});

app.get("/employee/:empNum",(req, res) => {
    try {
        serverData.getEmployeesByNum(parseInt(req.params.empNum)).then(employee => {
            res.send(employee);
        }).catch(Message => {
            res.status(404).send({ Message });
        });
    } 
    catch (e) {
        res.status(500).send({ Message: e.Message});
    }
});

app.all("*",(req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/pageNotFound.html"));
});

serverData.initialize().then(_ => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port "+ HTTP_PORT);    
    });
}).catch(e => {
    console.log(e);
});