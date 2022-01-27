const path = require('path');
const express = require('express');
const viewController = require('../controllers/view');

const router = express.Router();

router.get('/', viewController.getView);

router.get('/view/employee-info', viewController.getEmployeeInfo);

router.get('/view/hours', viewController.getHours);

router.get('/view/salaries', viewController.getSalaries);

router.get('/view/job-assignments', viewController.getJobAssignments);

router.get('/view/flight-assignments', viewController.getFlightAssignments);

router.get('/view/positions', viewController.getPositions);

router.get('/view/field', viewController.getFields);

router.get('/view/locations', viewController.getLocations);

router.get('/view/benefits-employee', viewController.getBenefitsEmployees);

router.get('/view/benefits', viewController.getBenefits);

router.get('/view/vacations', viewController.getVacations);

router.get('/view/flight-information', viewController.getFlightInformation);

router.get('/edit/:pkValues', viewController.getEdit);

router.post('/edit', viewController.postEdit);

router.get('/delete/:pkValues', viewController.getDelete);

router.get('/add', viewController.getAddForm);

router.post('/add', viewController.postAdd);

module.exports = router;
