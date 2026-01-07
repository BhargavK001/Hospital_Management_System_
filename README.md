# OneCare - Hospital Management System

OneCare is a comprehensive Hospital Management System designed to streamline operations for clinics, doctors, patients, and administrators. It features a robust backend built with Node.js and Express, and a dynamic frontend built with React and Vite.

## Project Structure

### Backend (`/backend`)

The backend follows a modular architecture using Express and Mongoose (MongoDB).

- **`config/`**: Database and application configurations.
- **`controllers/`**: Logic for handling API requests and business rules.
- **`middleware/`**: Custom middleware for authentication, error handling, and file uploads.
- **`models/`**: Mongoose schemas defining the data structure for appointments, patients, clinics, etc.
- **`routes/`**: API endpoint definitions, organized by feature (e.g., `appointmentRoutes`, `authRoutes`).
- **`utils/`**: Helper utilities and common functions.
- **`uploads/`**: Directory for storing uploaded files (e.g., prescriptions, profile pictures).

### Frontend (`/frontend`)

The frontend is a React-based Single Page Application (SPA) structured by user roles and dashboards.

- **`src/auth/`**: Authentication services and login logic.
- **`src/admin-dashboard/`**: Components and views for system administrators.
- **`src/clinic-dashboard/`**: Features tailored for clinic management.
- **`src/doctor-dashboard/`**: Tools for doctors to manage sessions, patients, and encounters.
- **`src/patient-dashboard/`**: Interface for patients to book appointments and view records.
- **`src/receptionist/`**: Dashboard for receptionist tasks.
- **`src/components/` & `src/global_components/`**: Reusable UI components.
- **`src/context/`**: Global state management using React Context.
- **`src/utils/`**: Frontend helper functions and API configurations.

## Getting Started

### Backend Setup

1. Navigate to `/backend`.
2. Install dependencies: `npm install`.
3. Configure your `.env` file with MongoDB URI and other secrets.
4. Run the server: `node index.js` (or use `nodemon`).

### Frontend Setup

1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Configure `.env` with the backend API URL.
4. Run the development server: `npm run dev`.

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS (or Vanilla CSS), Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.
- **Deployment**: AWS (see `OneCare_AWS_Deployment_Guide.md` for details).

---

_For detailed developer guides, refer to `Backend_Developer_Guide.md` and `Frontend_Developer_Guide.md` in the root directory._
