const fs = require('fs');

class Data {
    constructor(employees, departments) {
        this.employees  = employees;
        this.departments = departments;
    }
}

let allData = null;

//initialize()
module.exports.initialize = function() {
    return new Promise(function(resolve, reject){
        fs.readFile('./data/employees.json', function(err, employeeDataFromFile) {
            if(err) {
                reject("Unable to read employees.json");
            }
            else {
                fs.readFile('./data/departments.json', function(err, departmentDataFromFile) {
                    if(err) {
                        reject("Unable to read departments.json");
                    }
                    else {
                        allData = new Data(JSON.parse(employeeDataFromFile),JSON.parse(departmentDataFromFile));
                        resolve();
                    } 
                });
            } 
        });
    });
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve, reject) {
        if(allData.employees.length > 0) {
            resolve(allData.employees);
        }
        else {
            reject("no results returned for Employees");
        }
    });
}

module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject) {
        if(allData.departments.length > 0) {
            resolve(allData.departments);
        }
        else {
            reject('no results returned for Departments');
        }
    });
}

module.exports.getManagers = function() {
    return new Promise(function(resolve, reject) {
        let arrManagers=[];
        if(allData.employees.length > 0) {
            for(let i= 0; i < allData.employees.length; i++)
            {
                if(allData.employees[i].isManager == true) {
                    arrManagers.push(allData.employees[i]);
                }
            }    
            resolve(arrManagers);
        }
        else {
            reject("no results returned for Managers");
        }
    });
}

module.exports.getEmployeesByDepartment = function(department) {
    return new Promise((resolve, reject) => {
        let arrayByEmpDept = [];
        for(let i = 0; i < allData.employees.length; i++) {
            if(allData.employees[i].department == department) {
                arrayByEmpDept.push(allData.employees[i]);
            }
        }
        if(arrayByEmpDept.length > 0) {
            resolve(arrayByEmpDept);
        }
        else {
            reject(`no results returned for this Department Number ${department}`);     
        }            
    });
} 

module.exports.getEmployeesByNum = function(num) {
    return new Promise((resolve, reject) => {
        let found = false;
        let arrByEmpNum = [];
        for(let i = 0; i < allData.employees.length; i++) {
            if(allData.employees[i].employeeNum == num) {
                arrByEmpNum.push(allData.employees[i]);
                found = true;
                break;
            }
        }
        if(found == true) {
            resolve(arrByEmpNum);    
        }
        else {
            reject(`no results returned for this Employee Number ${num}`); 
        }
    });
}

module.exports.addEmployee = function(employeeData) {
    return new Promise(async (resolve, reject) => {
        try {
            if(employeeData.employeeManagerNum) {
                let mgr = await this.getEmployeesByNum(parseInt(employeeData.employeeManagerNum));
                if(!mgr) {
                    throw new Error("Manager does not exist");
                }
            }
            employeeData.isManager = (employeeData.isManager) ? true : false;
            employeeData.department = parseInt(employeeData.department);
            let newEmployee = Object.assign({}, {
                employeeNum: allData.employees.length + 1
            }, employeeData);
            allData.employees.push(newEmployee);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}