const pool = require('./util/database')
const fs = require("fs")
const path = require("path")

function interpolate(str, arr) {
    let retStr = ""
    let j = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '$') {
            retStr += arr[j]
            j++
            i++
            continue
        }
        retStr += str[i]
    }
    return retStr
}

var salaryTransaction = async (tableName, paycheck_id, values, res, add=false) => {
    let query = "SELECT pay_rate, overtime_pay_rate " +
        "FROM positions " +
        "WHERE pos_id IN ( " +
        "SELECT pos_id " +
        "FROM monthly_hours " +
        "WHERE paycheck_id='" + paycheck_id + "');"

    let queryOut = "/*Retrieving pay values based on an employee's job position*/\nSELECT pay_rate, overtime_pay_rate \n" +
        "FROM positions \n" +
        "WHERE pos_id IN ( \n" +
        "SELECT pos_id \n" +
        "FROM monthly_hours \n" +
        "WHERE paycheck_id='" + paycheck_id + "');\n\n"
    fs.appendFileSync(path.join(__dirname, "/sql", "query.sql"), queryOut)

    let client = await pool.connect()
    try {
        let queryRes = await client.query(query)
        let payRate = queryRes.rows[0].pay_rate, otPayRate = queryRes.rows[0].overtime_pay_rate, hours = 0, otHours = 0
        let taxRate = 0

        if (tableName == "monthly_hours") {
            if (values[7] == null) { taxRate = 0 }
            else { taxRate = values[7] }

            if (values[4] == null) { hours = 0 }
            else { hours = values[4] }

            if (values[5] == null) { otHours = 0 }
            else { otHours = values[5] }
        }
        else {
            if (values[0] == null) { taxRate = 0 }
            else { taxRate = values[0] }

            if (values[1] == null) { hours = 0 }
            else { hours = values[1] }

            if (values[2] == null) { otHours = 0 }
            else { otHours = values[2] }
        }

        let grossPay = (parseInt(hours) * parseFloat(payRate)) + (parseInt(otHours) * parseFloat(otPayRate))
        let netPay = grossPay * (1 - parseFloat(taxRate))
        let deductions = grossPay - netPay

        grossPay = parseFloat(grossPay.toFixed(2))
        netPay = parseFloat(netPay.toFixed(2))
        deductions = parseFloat(deductions.toFixed(2))

        let qTemp = ""
        transactionOut = "BEGIN\n"
        if (add) {
            await client.query("BEGIN")
            qTemp = "INSERT INTO monthly_salary VALUES('" + paycheck_id + "', " + grossPay + ", " + deductions + ", " + netPay + ");"
            transactionOut += "/*Inserting a row into monthly salary based on employee's monthly_hours*/\nINSERT INTO monthly_salary VALUES('" + paycheck_id + "', " + grossPay + ", " + deductions + ", " + netPay + ");\n\n"
        }
        else {
            qTemp = "UPDATE monthly_salary SET gross_pay=" + grossPay + ", deductions=" + deductions + ", net_pay=" + netPay + " WHERE paycheck_id='" + paycheck_id + "';"
            await client.query("BEGIN")
            transactionOut += "/*Editing a row from monthly salary based on employee's updated monthly_hours*/\nUPDATE monthly_salary \nSET gross_pay=" + grossPay + ", deductions=" + deductions + ", net_pay=" + netPay + " \nWHERE paycheck_id='" + paycheck_id + "';\n\n"
        }

        await client.query(qTemp)
        await client.query('COMMIT')

        transactionOut += "COMMIT\n\n"
        fs.appendFileSync(path.join(__dirname, "/sql", "transaction.sql"), transactionOut)
    }
    catch (e) {
        await client.query('ROLLBACK')
        console.log(e.toString())

        transactionOut += "ROLLBACK\n\n"
        fs.appendFileSync(path.join(__dirname, "/sql", "transaction.sql"), transactionOut)

        res.render("main/error", {
            pageTitle: "Error",
            path: '/add',
            error: e.toString()
        })
    } finally {
        client.release()
    }
}

function format(arr) {
    let retArr = []
    for (let i = 0; i < arr.length; i++) {
        if (isNaN(arr[i])) {
            retArr[i] = "'" + arr[i] + "'"
        }
        else {
            retArr[i] = arr[i]
        }
    }
    return retArr
}

exports.transaction = async (table, query, values, res, salary = false, edit = false, add = false) => {
    let transactionOut = "BEGIN\n"
    if (add) {
        transactionOut += "/*Adding a row to table: " + table + "*/\n"
    }
    else if (edit) {
        transactionOut += "/*Editing a row from table: " + table + "*/\n"
    }
    else {
        transactionOut += "/*Deleting a row from table: " + table + "*/\n"
    }

    try { transactionOut += interpolate(query, format(values)) + "\n" }
    catch (e) { console.log(e) }

    let client = await pool.connect()
    try {
        await client.query('BEGIN')
        await client.query(query, values)
        await client.query('COMMIT')

        transactionOut += "COMMIT\n\n"
        fs.appendFileSync(path.join(__dirname, "/sql", "transaction.sql"), transactionOut)

    } catch (e) {
        await client.query('ROLLBACK')
        console.log(e.toString())

        transactionOut += "ROLLBACK\n\n"
        fs.appendFileSync(path.join(__dirname, "/sql", "transaction.sql"), transactionOut)

        res.render("main/error", {
            pageTitle: "Error",
            path: '/add',
            error: e.toString()
        })
    } finally {
        client.release()
    }

    if (table == "positions" && (edit)) {
        let query = "SELECT * FROM monthly_hours WHERE pos_id='" + values[0] + "';"

        let client = await pool.connect()
        try {
            let queryRes = await client.query(query)

            query += "\n\n"
            fs.appendFileSync(path.join(__dirname, "/sql", "query.sql"), query)

            if (queryRes.rowCount > 0) {
                for (let i = 0; i < queryRes.rowCount; i++) {
                    let vals = []
                    let row = queryRes.rows[i]
                    vals.push(row.tax_rate)
                    vals.push(row.reg_hours)
                    vals.push(row.overtime_hours)

                    await salaryTransaction("positions", row.paycheck_id, vals, res)
                }
            }
        } 
        catch (e) {
            console.log(e.toString())

            res.render("main/error", {
                pageTitle: "Error",
                path: '/add',
                error: e.toString()
            })
        } 
        finally {
            client.release()
        }
    }

    if (table == "monthly_hours" && (add || edit)) {
        salaryTransaction("monthly_hours", values[8], values, res, add)
    }

    if (table == "positions") {
        res.redirect('/view/positions')
    }
    else if (salary) {
        res.redirect('/view/salary')
    }
    else if (table == "monthly_hours") {
        res.redirect('/view/hours')
    }
    else if (table == "employee_info") {
        res.redirect('/view/employee-info')
    }
    else if (table == "assignments") {
        res.redirect('/view/job-assignments')
    }
    else if (table == "benefits_applied") {
        res.redirect('/view/benefits-employee')
    }
    else if (table == "benefits") {
        res.redirect('/view/benefits')
    }
    else if (table == "field") {
        res.redirect('/view/field')
    }
    else if (table == "flight_assignments") {
        res.redirect('/view/flight-assignments')
    }
    else if (table == "flights") {
        res.redirect('/view/flight-information')
    }
    else if (table == "locations") {
        res.redirect('/view/locations')
    }
    else if (table == "vacation") {
        res.redirect('/view/vacations')
    }
}

exports.alphanumeric = (inputtxt) => {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if (inputtxt.match(letterNumber)) {
        return true;
    }
    else {
        return false;
    }
}

exports.renderInfo = async (pageTitle, rows, headers, displayHeaders, tableName, pkNames, pkSize, res, salary = false) => {
    res.json({mes: "hello"});
    res.render("main/info", {
        pageTitle: pageTitle,
        path: '/',
        info: rows,
        headers: headers,
        table: tableName,
        pk: pkNames,
        pkSize: pkSize,
        displayHeaders: displayHeaders,
        salary: salary
    })
}