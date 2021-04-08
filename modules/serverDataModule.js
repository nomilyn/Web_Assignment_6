const Sequelize = require("sequelize");

var sequelize = new Sequelize('da4ckntfd10j0u', 'jlwgttbtechgph', '7ac2bfa5fc1a054a1aae97cc9e9f04916c7ddbc1ecb1df0c00ba3aafcbfbd6f0', {
    host: 'ec2-34-233-0-64.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

let Department = sequelize.define("Department", {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
},
    {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
    });

let Employee = sequelize.define("Employee", {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
},
    {
        createdAt: false,
        updatedAt: false
    });

Department.hasMany(Employee, { foreignKey: 'department' });

//initialize()
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            resolve();
        }).catch(err => {
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            raw: true,
            order: ["employeeNum"]
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            raw: true,
            order: ["departmentId"]
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                department: department
            },
            raw: true
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findOne({
            where: {
                employeeNum: num
            },
            raw: true
        }).then(employee => {
            if(employee) {
                resolve(employee);
            }
            else {
                reject(`Unable to find employee with number ${num}`);
            }
        }).catch(err => {
            reject("no results returned");
        });
    });
}

module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.findOne({
            where: {
                departmentId: id
            },
            raw: true
        }).then(department => {
            if (department) {
                resolve(department);
            } else {
                reject(`Unable to find department with ID ${id}`);
            }
        }).catch(err => {
            reject("no results returned");
        });
    });
}

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        if (employeeData.employeeManagerNum) {
            employeeData.employeeManagerNum = parseInt(employeeData.employeeManagerNum);
        } else if (employeeData.employeeManagerNum === "") {
            employeeData.employeeManagerNum = null;
        }
        Employee.create(employeeData).then(() => {
            resolve();
        }).catch(e => {
            reject("Unable to create employee");
        });
    });
}

module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        Department.create(departmentData).then(() => {
            resolve();
        }).catch(e => {
            reject("Unable to create department");
        });
    });
}

module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;  
        if (employeeData.employeeManagerNum) {
            employeeData.employeeManagerNum = parseInt(employeeData.employeeManagerNum);
        } else if (employeeData.employeeManagerNum === "") {
            employeeData.employeeManagerNum = null;
        }      
        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(() => {
            resolve();
        }).catch(err => {
            reject("Unable to update employee");
        });
    });
}

module.exports.updateDepartment = function (deptData) {
    return new Promise(function (resolve, reject) {
        Department.update({
            departmentName: deptData.departmentName
        }, {
            where: {
                departmentId: deptData.departmentId
            }
        }).then(() => {
            resolve();
        }).catch(err => {
            reject("Unable to update department");
        });
    });
}

module.exports.deleteDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.destroy({
            where: {
                departmentId: id
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject();
        });
    });
}

module.exports.deleteEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: num
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject();
        });
    });
}
