//REMINDER: Always pass multi-attribute PKS with commas for "res.render" function
const pool = require('../util/database')
const creds = require('../creds.json')
const fs = require("fs")
const helper = require('../helper')
const path = require('path')

exports.getView = async (req, res, next) => {
    res.render("main/view", {
        pageTitle: "Views",
        path: "/"
    })
}

exports.getEmployeeInfo = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM employee_info;")
        let queryOut = "/*Retireving all rows from table: employee_info*/\nSELECT * FROM employee_info;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)
        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getEmployeeInfo Controller: " + e)
    }
    client.release()

    headers = ["SSN", "Employee ID", "Name", "D.O.B.", "Address", "Phone Number", "Sex", "Email"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].ssn)
        data.push(employeeRows[j].emp_id)
        data.push(employeeRows[j].fullname)
        data.push(employeeRows[j].date_of_birth)
        data.push(employeeRows[j].address)
        data.push(employeeRows[j].phone_number)
        data.push(employeeRows[j].sex)
        data.push(employeeRows[j].email)
        rows.push(data)
    }

    try {
        await helper.renderInfo("Employee Information", rows, headers, headers, "employee_info", "ssn", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getHours = async (req, res, next) => {
    let hours = [], i = 0, rows = []
    let client = await pool.connect()
    try {
        let query = 'SELECT employee_info.fullname, month, year, monthly_hours.emp_id, reg_hours, overtime_hours, sick_leave_hours, tax_rate, paycheck_id FROM monthly_hours INNER JOIN employee_info ON employee_info.emp_id=monthly_hours.emp_id;'

        let queryOut = "/*Retireving rows from table: employee_info, and monthly_hours*/\nSELECT employee_info.fullname, month, year, monthly_hours.emp_id, reg_hours, overtime_hours, \nsick_leave_hours, tax_rate, paycheck_id \nFROM monthly_hours \nINNER JOIN employee_info ON employee_info.emp_id=monthly_hours.emp_id;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        let queryRes = await client.query(query)
        queryRes.rows.forEach(row => {
            hours[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getHours: " + e)
    }
    finally {
        client.release()
    }

    let dHeaders = ['Month', 'Year', "Employee ID", 'Name', 'Regular Hours', 'OT Hours', 'Leave Hours', 'Tax Rate', 'Paycheck ID']
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(hours[j].month)
        data.push(hours[j].year)
        data.push(hours[j].emp_id)
        data.push(hours[j].fullname)
        data.push(hours[j].reg_hours)
        data.push(hours[j].overtime_hours)
        data.push(hours[j].sick_leave_hours)
        data.push(hours[j].tax_rate)
        data.push(hours[j].paycheck_id)
        rows.push(data)
    }

    let headers = ['Month', 'Year', "Employee ID", "Position ID", 'Regular Hours', 'OT Hours', 'Leave Hours', "Tax Rate", "Paycheck ID"]

    try {
        await helper.renderInfo("Monthly Employee Info", rows, headers, dHeaders, "monthly_hours", "month,year,emp_id", 3, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getSalaries = async (req, res, next) => {
    const client = await pool.connect()
    let salaries = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT employee_info.fullname, employee_info.emp_id, m.paycheck_id, m.gross_pay, m.deductions, m.net_pay FROM monthly_salary AS m " +
            "INNER JOIN monthly_hours ON monthly_hours.paycheck_id=m.paycheck_id INNER JOIN employee_info ON monthly_hours.emp_id=employee_info.emp_id;")

        let queryOut = "/*Retireving rows from table: employee_info, monthly_salary, and monthly_hours*/\nSELECT employee_info.fullname, employee_info.emp_id, m.paycheck_id, m.gross_pay, m.deductions, m.net_pay \nFROM monthly_salary AS m " +
            "\nINNER JOIN monthly_hours ON monthly_hours.paycheck_id=m.paycheck_id \nINNER JOIN employee_info ON monthly_hours.emp_id=employee_info.emp_id;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            salaries[i] = row
            i++
        });
    }
    catch (e) {
        console.log("salaries Controller: " + e)
    }
    client.release()

    let dHeaders = ["Paycheck ID", "Name", "Employee ID", "Gross Pay", "Deductions", "Net Pay"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(salaries[j].paycheck_id)
        data.push(salaries[j].fullname)
        data.push(salaries[j].emp_id)
        data.push(salaries[j].gross_pay)
        data.push(salaries[j].deductions)
        data.push(salaries[j].net_pay)
        rows.push(data)
    }

    headers = ["Paycheck ID", "Gross Pay", "Deductions", "Net Pay"]

    try {
        await helper.renderInfo("Employee Salaries", rows, headers, dHeaders, "monthly_salary", "paycheck_id", 1, res, true)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getJobAssignments = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT assignment_id, e.fullname, a.emp_id, p.pos_name, f.field_name, l.loca_name, a.start_date, a.end_date FROM assignments AS a INNER JOIN employee_info AS e ON a.emp_id=e.emp_id INNER JOIN positions AS p ON p.pos_id=a.pos_id INNER JOIN field AS f ON f.field_id=a.field_id INNER JOIN locations AS l ON l.loca_code=a.loca_code;")

        let queryOut = "/*Retireving rows from table: employee_info, positions, locations, and assignments*/\nSELECT assignment_id, e.fullname, a.emp_id, p.pos_name, f.field_name, l.loca_name, a.start_date, a.end_date \nFROM assignments AS a \nINNER JOIN employee_info AS e ON a.emp_id=e.emp_id \nINNER JOIN positions AS p ON p.pos_id=a.pos_id \nINNER JOIN field AS f ON f.field_id=a.field_id \nINNER JOIN locations AS l ON l.loca_code=a.loca_code;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getJobAssignments Controller: " + e)
    }
    client.release()

    let dHeaders = ["Assignment ID", "Name", "Employee ID", "Position Name", "Field", "Location Name", "Start Date", "End Date"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].assignment_id)
        data.push(employeeRows[j].fullname)
        data.push(employeeRows[j].emp_id)
        data.push(employeeRows[j].pos_name)
        data.push(employeeRows[j].field_name)
        data.push(employeeRows[j].loca_name)
        data.push(employeeRows[j].start_date)
        data.push(employeeRows[j].end_date)
        rows.push(data)
    }

    headers = ["Assignment ID", "Employee ID", "Position ID", "Field ID", "Location Code", "Start Date", "End Date"]

    try {
        await helper.renderInfo("Job Assignments", rows, headers, dHeaders, "assignments", "assignment_id", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getFlightAssignments = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT e.fullname, f.emp_id, f.flight_id, f.start_date, f.end_date FROM flight_assignments AS f INNER JOIN employee_info AS e ON f.emp_id=e.emp_id;")

        let queryOut = "/*Retireving rows from table: employee_info and flight_assignments*/\nSELECT e.fullname, f.emp_id, f.flight_id, f.start_date, f.end_date \nFROM flight_assignments AS f \nINNER JOIN employee_info AS e ON f.emp_id=e.emp_id;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getFlightAssignments Controller: " + e)
    }
    client.release()

    let dHeaders = ["Employee ID", "Flight ID", "Employee Name", "Start Date", "End Date"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].emp_id)
        data.push(employeeRows[j].flight_id)
        data.push(employeeRows[j].fullname)
        data.push(employeeRows[j].start_date)
        data.push(employeeRows[j].end_date)
        rows.push(data)
    }

    headers = ["Employee ID", "Flight ID", "Start Date", "End Date"]

    try {
        await helper.renderInfo("Flight Assignments", rows, headers, dHeaders, "flight_assignments", "emp_id,flight_id", 2, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getPositions = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM positions;")

        let queryOut = "/*Retireving all rows from positions: field*/\nSELECT * FROM positions;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getPositions Controller: " + e)
    }
    client.release()

    headers = ["Position ID", "Position Name", "Pay Rate", "Overtime Pay Rate"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].pos_id)
        data.push(employeeRows[j].pos_name)
        data.push(employeeRows[j].pay_rate)
        data.push(employeeRows[j].overtime_pay_rate)
        rows.push(data)
    }

    try {
        await helper.renderInfo("Positions", rows, headers, headers, "positions", "pos_id", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getFields = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM field;")

        let queryOut = "/*Retireving all rows from table: field*/\nSELECT * FROM field;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getFields Controller: " + e)
    }
    client.release()

    headers = ["Field ID", "Field Name"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].field_id)
        data.push(employeeRows[j].field_name)
        rows.push(data)
    }

    try {
        await helper.renderInfo("Fields", rows, headers, headers, "field", "field_id", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getLocations = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM locations;")

        let queryOut = "/*Retireving all rows from table: locations*/\nSELECT * FROM locations;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getLocations Controller: " + e)
    }
    client.release()

    headers = ["Location Code", "Location Name", "Street Address", "City", "State"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].loca_code)
        data.push(employeeRows[j].loca_name)
        data.push(employeeRows[j].street_address)
        data.push(employeeRows[j].city)
        data.push(employeeRows[j].state)
        rows.push(data)
    }

    try {
        await helper.renderInfo("Locations", rows, headers, headers, "locations", "loca_code", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getBenefitsEmployees = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT ba.emp_id, ba.benf_code, e.fullname, b.benf_name, ba.date_applied FROM benefits_applied AS ba INNER JOIN employee_info AS e ON ba.emp_id=e.emp_id INNER JOIN benefits AS b ON b.benf_code=ba.benf_code;")

        let queryOut = "/*Retireving rows from table: employee_info, benefits_applied, and benefits*/\nSELECT e.fullname, ba.emp_id, b.benf_name, ba.benf_code, ba.date_applied \nFROM benefits AS ba \nINNER JOIN employee_info AS e ON ba.emp_id=e.emp_id \nINNER JOIN benefits AS b ON b.benf_code=ba.benf_code;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getBenefitsEmployees Controller: " + e)
    }
    client.release()

    let dHeaders = ["Employee ID", "Benefit Code", "Employee Name", "Benefit Name", "Date Applied"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].emp_id)
        data.push(employeeRows[j].benf_code)
        data.push(employeeRows[j].fullname)
        data.push(employeeRows[j].benf_name)
        data.push(employeeRows[j].date_applied)
        rows.push(data)
    }

    headers = ["Employee ID", "Benefit Code", "Date Applied"]

    try {
        await helper.renderInfo("Employee Benefits", rows, headers, dHeaders, "benefits_applied", "emp_id,benf_code", 2, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getBenefits = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM benefits")

        let queryOut = "/*Retireving all rows from table: benefits*/\nSELECT * FROM benefits\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getBenefits Controller: " + e)
    }
    client.release()

    let dHeaders = ["Benefit Code", "Benefit Name"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].benf_code)
        data.push(employeeRows[j].benf_name)
        rows.push(data)
    }

    headers = [...dHeaders]

    try {
        await helper.renderInfo("Benefits", rows, headers, dHeaders, "benefits", "benf_code", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getVacations = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT e.fullname, v.emp_id, v.vacation_id, v.num_of_days, v.start_date, v.end_date FROM vacation AS v INNER JOIN employee_info AS e ON v.emp_id=e.emp_id;")

        let queryOut = "/*Retireving rows from table: employee_info and vacation*/\nSELECT e.fullname, v.emp_id, v.vacation_id, v.num_of_days, v.start_date, v.end_date \nFROM vacation AS v \nINNER JOIN employee_info AS e ON v.emp_id=e.emp_id;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getVacations Controller: " + e)
    }
    client.release()

    let dHeaders = ["Vacation ID", "Employee Name", "Employee ID", "Num. of Days", "Start Date", "End Date"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].vacation_id)
        data.push(employeeRows[j].fullname)
        data.push(employeeRows[j].emp_id)
        data.push(employeeRows[j].num_of_days)
        data.push(employeeRows[j].start_date)
        data.push(employeeRows[j].end_date)
        rows.push(data)
    }

    headers = ["Vacation ID", "Employee ID", "Num. of Days", "Start Date", "End Date"]

    try {
        await helper.renderInfo("Vacations", rows, headers, dHeaders, "vacation", "vacation_id", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getFlightInformation = async (req, res, next) => {
    const client = await pool.connect()
    let employeeRows = [], i = 0, headers = [], rows = []

    try {
        let queryRes = await client.query("SELECT * FROM flights;")

        let queryOut = "/*Retireving all rows from table: flights*/\nSELECT * FROM flights;\n\n"
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

        queryRes.rows.forEach(row => {
            employeeRows[i] = row
            i++
        });
    }
    catch (e) {
        console.log("getFlightInformation Controller: " + e)
    }
    client.release()

    headers = ["Flight ID", "Model", "Destination Location Code"]
    for (let j = 0; j < i; j++) {
        let data = []
        data.push(employeeRows[j].flight_id)
        data.push(employeeRows[j].model)
        data.push(employeeRows[j].dest_loca_code)
        rows.push(data)
    }

    try {
        await helper.renderInfo("Flight Information", rows, headers, headers, "flights", "flight_id", 1, res)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getEdit = async (req, res, next) => {
    //pkNamesQuery is a string of the PK columns
    let salary = false, queryOut = ""
    let editMode = req.query.edit, table = req.query.table, pkNamesQuery = req.query.pk, pkSize = req.query.pkSize
    let pkValuesStringParam = req.params.pkValues, client, queryRes

    let pkColsArr = [], pkValuesArr = [], data = []

    if (pkNamesQuery.includes(',')) {
        pkColsArr = pkNamesQuery.split(",")
    }
    else {
        pkColsArr = [pkNamesQuery]
    }

    if (pkValuesStringParam.includes(',')) {
        pkValuesArr = pkValuesStringParam.split(",")
    }
    else {
        pkValuesArr = [pkValuesStringParam]
    }

    let queryCond = "", i = 0, queryCondOut = ""
    for (let pkName of pkColsArr) {
        if (i == 0) {
            queryCond += pkName + " = $" + (i + 1)
            queryCondOut += pkName + " = " + pkValuesArr[i]
        }
        else {
            queryCond += " AND " + pkName + "= $" + (i + 1)
            queryCondOut += " AND " + pkName + " = " + pkValuesArr[i]
        }
        i++
    }
    let query = "SELECT * FROM " + table + " WHERE " + queryCond
    queryOut = "/*Retreiving table to edit*/\nSELECT *\nFROM " + table + "\WHERE " + queryCondOut + ";\n\n"

    client = await pool.connect()

    queryRes = await client.query(query, pkValuesArr)
    let row = queryRes.rows[0]

    fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

    query = "SELECT column_name FROM information_schema.columns WHERE table_schema = '" + creds.username + "' AND table_name = '" + table + "';"
    queryRes = await client.query(query)

    queryOut = "/*Retrieving the column names for table: " + table + "*/\nSELECT column_name \nFROM information_schema.columns \nWHERE table_schema = '" + creds.username + "' AND table_name = '" + table + "';\n\n"
    fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)

    let headers = [], num = queryRes.rowCount
    for (let j = 0; j < num; j++) {
        headers.push(queryRes.rows[j].column_name)
    }

    client.release()

    for (let x in row) {
        data.push(row[x])
    }

    if (salary == false) {
        salary = ""
    }
    else {
        salary = "true"
    }

    res.render("main/edit", {
        pageTitle: "Edit",
        path: "/edit",
        editing: editMode,
        row: data,
        headers: headers,
        display: headers,
        headerCount: num,
        pkValuesArr: pkValuesArr,
        table: table,
        pkSize: pkSize,
        salary: salary
    })
}

exports.postEdit = async (req, res, next) => {
    let updates = []
    let headers = req.body.headers, table = req.body.table, pkValuesArr = req.body.pkValuesArr, pkSize = req.body.pkSize

    let salary = req.body.salary
    if (salary == "true") {
        salary = true
    }
    else {
        salary = false
    }

    headers = headers.split(",")
    pkValuesArr = pkValuesArr.split(",")
    for (let i = 0; i < headers.length; i++) {
        updates.push(eval("req.body." + headers[i]))
    }
    let updateValues = [...updates]

    for (let i = 0; i < updateValues.length; i++) {
        if (updateValues[i] == '') {
            updateValues[i] = null;
        }
    }

    let query = "UPDATE " + table + " SET ", maxI = 0
    for (let i = 0; i < headers.length; i++) {
        if (i == 0) {
            query += headers[i] + " = $" + (i + 1)
        }
        else {
            query += ", " + headers[i] + " = $" + (i + 1)
        }
        maxI = i + 1
    }

    query += " WHERE "
    for (let i = 0; i < pkSize; i++) {
        if (i == 0) {
            query += headers[i] + " = $" + (i + 1 + maxI)
        }
        else {
            query += " AND " + headers[i] + " = $" + (i + 1 + maxI)

        }
        updateValues.push(pkValuesArr[i])
    }
    query += ";"

    try {
        await helper.transaction(table, query, updateValues, res, salary, true, false)
    }
    catch (e) {
        console.log(e)
    }
}

exports.postAdd = async (req, res, next) => {
    let updates = []
    let headers = req.body.headers, table = req.body.table
    let headersArr = headers.split(',')

    for (let i = 0; i < headersArr.length; i++) {
        updates.push(eval("req.body." + headersArr[i]))
    }

    let query = "INSERT INTO " + table + "(" + headers + ") VALUES(", maxI = 0
    for (let i = 0; i < headersArr.length; i++) {
        if (i == 0) {
            query += "$" + (i + 1)
        }
        else {
            query += ", $" + (i + 1)
        }
        maxI = i + 1
    }
    query += ");"
    for (let i = 0; i < updates.length; i++) {
        if (updates[i] == '') {
            updates[i] = null;
        }
    }
    try {
        await helper.transaction(table, query, updates, res, false, false, true)
    }
    catch (e) {
        console.log(e)
    }
}

exports.getAddForm = async (req, res, next) => {
    let table = req.query.table, displayHeaders = req.query.headers, data = []
    displayHeaders = displayHeaders.split(',')

    let client = await pool.connect()

    let query = "SELECT column_name FROM information_schema.columns WHERE table_schema = '" + creds.username + "' AND table_name = '" + table + "';"
    queryRes = await client.query(query)

    let queryOut = "/*Retrieving the column names for table: " + table + "*/\nSELECT column_name \nFROM information_schema.columns \nWHERE table_schema = '" + creds.username + "' AND table_name = '" + table + "';\n\n"

    try {
        fs.appendFileSync(path.join(__dirname, "../sql", "query.sql"), queryOut)
    }
    catch (e) {
        console.log(e)
    }

    let headers = [], num = queryRes.rowCount
    for (let j = 0; j < num; j++) {
        headers.push(queryRes.rows[j].column_name)
    }

    num = headers.length
    for (let i = 0; i < num; i++) {
        data.push('')
    }

    res.render("main/edit", {
        pageTitle: "Add Form",
        path: "/add",
        editing: "",
        row: data,
        headers: headers,
        display: displayHeaders,
        headerCount: num,
        pkValuesArr: [],
        table: table,
        pkSize: 0
    })
}

exports.getDelete = async (req, res, next) => {
    let pkValues = req.params.pkValues
    let table = req.query.table, pkNames = req.query.pk, pkSize = req.query.pkSize
    pkNames = pkNames.split(',')
    pkValues = pkValues.split(',')

    let cond = ""
    for (let i = 0; i < pkSize; i++) {
        if (i == 0) {
            cond += pkNames[i] + " = $" + (i + 1)
        }
        else {
            cond += " AND " + pkNames[i] + " = $" + (i + 1)
        }
    }

    let query = "DELETE FROM " + table + " WHERE " + cond + ";"

    try {
        await helper.transaction(table, query, pkValues, res)
    }
    catch (e) {
        console.log(e)
    }
}