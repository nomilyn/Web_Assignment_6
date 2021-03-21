/*********************************************************************************************
* WEB700 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Nomilyn Cayton      Student ID: 118 902 204     Date: March 26, 2021
*
* Online (Heroku) Link: https://desolate-savannah-64855.herokuapp.com 
*
*********************************************************************************************/

const serverData = require("./modules/serverDataModule.js");
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");

app.use(express.static("public"));

app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
}); 

app.engine(".hbs", exphbs({ 
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }

    }
}));

app.set("view engine", ".hbs");

app.get("/", (req,res)=>{
    res.render("home");
});

app.get("/about", (req,res)=>{
    res.render("about");
});

app.get("/htmlDemo", (req,res)=>{
    res.render("htmlDemo");
});

app.get("/employees/add",(req, res) => {
    res.render("addEmployee");
});


app.get("/employees",(req,res) => {
    try {
        if(req.query.department) {
            serverData.getEmployeesByDepartment(parseInt(req.query.department)).then(empQueryData => {
                res.render("employees",{employees:empQueryData});
            }).catch(message => {
                res.render("employees",{message:"no results"});    
            });
        }
        else {       
            serverData.getAllEmployees().then(empData => {
                res.render("employees",{employees:empData});
            }).catch(Message => {
                res.render("employees",{message:"no results"});    
            });
        }
    }
    catch(e) {
        res.render("employees",{message:"no results"});    
    }
}); 

app.post("/employees/add", async (req, res) => {
    try {
        await serverData.addEmployee(req.body);
        res.redirect("/employees");
    }
    catch (e) {
        res.status(500).send({ message: e});
    }   
});

app.post("/employee/update", (req, res) => {
    serverData.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((e) => {
        res.status(500).send({ message: e}); 
    })
});
    
app.get("/departments",(req,res) => {
    try {
        serverData.getDepartments().then(deptData => {
            res.render("departments",{departments:deptData});
        }).catch(message => {
            res.render("departments",{message:"no results"});
        });
    }
    catch(e) {
        res.render("departments",{message:"no results"});
    }
});

/*
app.get("/managers",(req,res) => {
    try {
        serverData.getManagers().then(managers => {
            res.send(managers);
        }).catch(message => {
            res.status(404).send({ message });
        });
    }
    catch(e) {
        res.status(500).send({ message: e.message});
    }
});
*/

app.get("/employee/:empNum",(req, res) => {
    try {
        serverData.getEmployeesByNum(parseInt(req.params.empNum)).then(emp => {
            res.render("employee",{employee: emp});
        }).catch(message => {
            res.render("employee",{message:"no results"});
        });
    } 
    catch (e) {
        res.render("employee",{message:"no results"});    
    }
});

app.get("/department/:id",(req, res) => {
    try {
        serverData.getDepartmentById(parseInt(req.params.id)).then(dep => {
            res.render("department",{department:dep});
        }).catch(message => {
            res.render("department",{message:"no results"});
        });
    } 
    catch (e) {
        res.render("department",{message:"no results"});    
    }
});

app.all("*",(req, res) => {
    res.render("pageNotFound");
});

serverData.initialize().then(_ => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port "+ HTTP_PORT);    
    });
}).catch(e => {
    console.log(e);
});