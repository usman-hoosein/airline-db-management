/*Retireving all rows from table: field*/
SELECT * FROM field;

/*Retireving all rows from table: field*/
SELECT * FROM field;

/*Retireving rows from table: employee_info and flight_assignments*/
SELECT e.fullname, f.emp_id, f.flight_id, f.start_date, f.end_date 
FROM flight_assignments AS f 
INNER JOIN employee_info AS e ON f.emp_id=e.emp_id;

/*Retireving rows from table: employee_info and vacation*/
SELECT e.fullname, v.emp_id, v.vacation_id, v.num_of_days, v.start_date, v.end_date 
FROM vacation AS v 
INNER JOIN employee_info AS e ON v.emp_id=e.emp_id;

/*Retireving all rows from table: employee_info*/
SELECT * FROM employee_info;

/*Retrieving the column names for table: employee_info*/
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'dbs044' AND table_name = 'employee_info';

/*Retireving all rows from table: employee_info*/
SELECT * FROM employee_info;

/*Retireving all rows from table: employee_info*/
SELECT * FROM employee_info;

/*Retireving all rows from table: employee_info*/
SELECT * FROM employee_info;

