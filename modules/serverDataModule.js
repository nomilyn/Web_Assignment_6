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
        let empByEmpNum;
        for(let i = 0; i < allData.employees.length; i++) {
            if(allData.employees[i].employeeNum == num) {
                empByEmpNum=allData.employees[i];
                found = true;
                break;
            }
        }
        if(found == true) {
            resolve(empByEmpNum);    
        }
        else {
            reject(`no results returned for this Employee Number ${num}`); 
        }
    });
}

module.exports.getDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        let found = false;
        let DeptByDeptId;
        for(let i = 0; i < allData.departments.length; i++) {
            if(allData.departments[i].departmentId == id) {
                DeptByDeptId = allData.departments[i];
                found = true;
                break;
            }
        }
        if(found == true) {
            resolve(DeptByDeptId);    
        }
        else {
            reject('query returned 0 results'); 
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

module.exports.updateEmployee = function(empData) {
    return new Promise((resolve, reject) => {
        let updateEmpData = allData.employees;
            for (let i = 0; i < updateEmpData.length; i++) {
                if(updateEmpData[i].employeeNum == empData.employeeNum) {
                    updateEmpData[i].firstName = empData.firstName;
                    updateEmpData[i].lastName = empData.lastName;
                    updateEmpData[i].email = empData.email;
                    updateEmpData[i].SSN = empData.SSN;
                    updateEmpData[i].addressStreet = empData.addressStreet;
                    updateEmpData[i].addressCity = empData.addressCity;
                    updateEmpData[i].addressState = empData.addressState;
                    updateEmpData[i].addressPostal = empData.addressPostal;
                    updateEmpData[i].isManager = (empData.isManager) ? true : false;
                    updateEmpData[i].employeeManagerNum = empData.employeeManagerNum;
                    updateEmpData[i].status = empData.status;
                    updateEmpData[i].department = empData.department;
                    updateEmpData[i].hireDate = empData.hireDate;
                }
            }
            resolve();
    });
}

