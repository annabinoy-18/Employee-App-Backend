# Employee App Backend

Node.js + Express REST API connected to MongoDB Atlas. The provided `dist/Frontend` build is included unchanged.

## Setup
1. Install Node.js LTS.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and replace the placeholders in `MONGODB_URI` with your Atlas database user, password, and cluster URL. Do not commit `.env`.
4. In MongoDB Atlas, add your current IP address under Network Access and ensure the database user has read/write permissions.
5. Run `npm start`. The app starts on port 3000.
6. Open `http://localhost:3000`.

Database: `employee_database` (or `MONGODB_DATABASE`), collection: `employees`.

## API endpoints
- `GET /employeelist` or `GET /api/employeelist` — all employees
- `GET /employeelist/:id` or `GET /api/employeelist/:id` — one employee
- `POST /employeelist` or `POST /api/employeelist` — create employee
- `PUT /employeelist` or `PUT /api/employeelist` — update employee (send `_id` in JSON body)
- `DELETE /employeelist/:id` or `DELETE /api/employeelist/:id` — delete employee

JSON body for create/update: `{"name":"Asha","location":"Kochi","position":"Developer","salary":45000}`. For updates, also include the employee's `_id`.
