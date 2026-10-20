// Task1: initiate app and run server at 3000

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path=require('path');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Also serve the exact folder casing used by the supplied ZIP (works on Linux too).
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task 2 : MongoDB Atlas connection. Set MONGODB_URI in your local .env file.
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'employee_database';
let employees;

async function connectToMongoDB() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to a .env file.');
    }
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    employees = db.collection('employees');
    await employees.createIndex({ name: 1 });
    console.log(`Connected to MongoDB Atlas database: ${DATABASE_NAME}`);
}

function parseEmployeeId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}

function validateEmployee(body) {
    const { name, location, position, salary } = body || {};
    if (![name, location, position, salary].every(v => v !== undefined && String(v).trim() !== '')) {
        return 'name, location, position and salary are required';
    }
    if (!Number.isFinite(Number(salary)) || Number(salary) < 0) {
        return 'salary must be a valid non-negative number';
    }
    return null;
}

// TODO implementation: GET all employees (both paths supported for compatibility).
async function getAllEmployees(req, res) {
    try {
        const result = await employees.find({}).sort({ _id: -1 }).toArray();
        res.status(200).json(result);
    } catch (error) {
        console.error('Get employees failed:', error);
        res.status(500).json({ message: 'Failed to retrieve employees' });
    }
}
app.get(['/employeelist', '/api/employeelist'], getAllEmployees);

// TODO implementation: GET one employee by MongoDB _id.
async function getSingleEmployee(req, res) {
    try {
        const id = parseEmployeeId(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid employee id' });
        const employee = await employees.findOne({ _id: id });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(employee);
    } catch (error) {
        console.error('Get employee failed:', error);
        res.status(500).json({ message: 'Failed to retrieve employee' });
    }
}
app.get(['/employeelist/:id', '/api/employeelist/:id'], getSingleEmployee);

// TODO implementation: POST a new employee.
async function addEmployee(req, res) {
    try {
        const validationError = validateEmployee(req.body);
        if (validationError) return res.status(400).json({ message: validationError });
        const employee = {
            name: String(req.body.name).trim(),
            location: String(req.body.location).trim(),
            position: String(req.body.position).trim(),
            salary: Number(req.body.salary)
        };
        const result = await employees.insertOne(employee);
        res.status(201).json({ ...employee, _id: result.insertedId });
    } catch (error) {
        console.error('Add employee failed:', error);
        res.status(500).json({ message: 'Failed to add employee' });
    }
}
app.post(['/employeelist', '/api/employeelist'], addEmployee);

// TODO implementation: DELETE one employee by MongoDB _id.
async function deleteEmployee(req, res) {
    try {
        const id = parseEmployeeId(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid employee id' });
        const result = await employees.deleteOne({ _id: id });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete employee failed:', error);
        res.status(500).json({ message: 'Failed to delete employee' });
    }
}
app.delete(['/employeelist/:id', '/api/employeelist/:id'], deleteEmployee);

// TODO implementation: PUT update. The supplied frontend sends the employee object,
// including its MongoDB _id, in the request body.
async function updateEmployee(req, res) {
    try {
        const validationError = validateEmployee(req.body);
        if (validationError) return res.status(400).json({ message: validationError });
        const id = parseEmployeeId(req.body._id || req.body.id);
        if (!id) return res.status(400).json({ message: 'A valid _id is required to update an employee' });
        const updatedFields = {
            name: String(req.body.name).trim(),
            location: String(req.body.location).trim(),
            position: String(req.body.position).trim(),
            salary: Number(req.body.salary)
        };
        const result = await employees.updateOne({ _id: id }, { $set: updatedFields });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ _id: id, ...updatedFields });
    } catch (error) {
        console.error('Update employee failed:', error);
        res.status(500).json({ message: 'Failed to update employee' });
    }
}
app.put(['/employeelist', '/api/employeelist'], updateEmployee);

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

// Start only after the Atlas connection succeeds.
connectToMongoDB()
    .then(() => app.listen(PORT, () => console.log(`Employee App running at http://localhost:${PORT}`)))
    .catch(error => {
        console.error('Could not start Employee App:', error.message);
        process.exit(1);
    });
