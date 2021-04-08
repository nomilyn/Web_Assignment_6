/*********************************************************************************************
* WEB700 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Nomilyn Cayton      Student ID: 118 902 204     Date: April 7, 2021
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

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
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

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

app.get("/employees/add", (req, res) => {
    serverData.getDepartments().then(departments => {
        res.render("addEmployee", { departments });
    }).catch(e => {
        res.status(500).send({
        message: 'Unable to fetch departments'
        });
    })

});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});


app.get("/employees", (req, res) => {
    try {
        if (req.query.department) {
            serverData.getEmployeesByDepartment(parseInt(req.query.department)).then(empQueryData => {
                if(empQueryData.length > 0) {
                    res.render("employees", { employees: empQueryData });
                }
                else {
                    res.render("employees", { message: "no results" });    
                }
                
            }).catch(message => {
                res.render("employees", { message: "no results" });
            });
        }
        else {
            serverData.getAllEmployees().then(empData => {
                if (empData.length > 0) {
                    res.render("employees", { employees: empData });
                }
                else {
                    res.render("employees", { message: "no results" });    
                }
            }).catch(Message => {
                res.render("employees", { message: "no results" });
            });
        }
    }
    catch (e) {
        res.render("employees", { message: "no results" });
    }
});

app.post("/employees/add", async (req, res) => {
    try {
        await serverData.addEmployee(req.body);
        res.redirect("/employees");
    }
    catch (e) {
        res.status(500).send({ message: e });
    }
});

app.post("/employee/update", (req, res) => {
    serverData.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((e) => {
        res.status(500).send({ message: e });
    })
});

app.get("/departments", (req, res) => {
    try {
        serverData.getDepartments().then(deptData => {
            if (deptData.length > 0) {
                res.render("departments", { departments: deptData });
            }
            else {
                res.render("departments", { message: "no results" });    
            }
        }).catch(message => {
            res.render("departments", { message: "no results" });
        });
    }
    catch (e) {
        res.render("departments", { message: "no results" });
    }
});

app.post("/departments/add", async (req, res) => {
    try {
        await serverData.addDepartment(req.body);
        res.redirect("/departments");
    }
    catch (e) {
        res.status(500).send({ message: e });
    }
});

app.post("/department/update", (req, res) => {
    serverData.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((e) => {
        res.status(500).send({ message: e });
    })
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    serverData.getEmployeeByNum(req.params.empNum).then((employeeData) => {
        if (employeeData) {
            viewData.employee = employeeData; //store employee data in the "viewData" object as "employee"
        }
        else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(serverData.getDepartments)
        .then((departmentsData) => {
            viewData.departments = departmentsData; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching 
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            }
            else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});


app.get("/department/:id", (req, res) => {
    try {
        serverData.getDepartmentById(parseInt(req.params.id)).then(dep => {
            if (dep.departmentId != null) {
                res.render("department", { department: dep });
            }
        }).catch(message => {
            res.status(404).send("Department Not Found");
        });
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
});

app.get("/employees/delete/:id", (req, res) => {
    try {
        serverData.deleteEmployeeByNum(parseInt(req.params.id)).then(emp => {
            res.redirect("/employees");
        }).catch(message => {
            res.status(500).send("Unable to Remove Employee / Employee not found");
        });
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
});

app.get("/departments/delete/:id", (req, res) => {
    try {
        serverData.deleteDepartmentById(parseInt(req.params.id)).then(dep => {
            res.redirect("/departments");
        }).catch(message => {
            res.status(500).send("Unable to Remove Department / Department not found");
        });
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
});

app.all("*", (req, res) => {
    res.render("pageNotFound");
});

serverData.initialize().then(_ => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port " + HTTP_PORT);
    });
}).catch(e => {
    console.log(e);
});