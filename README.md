
# HealSphere

Healthcare and Clinic Management System developed for the iNeuBytes major project.

HealSphere provides separate workflows for patients, doctors, and administrators. Patients can manage their profiles, book appointments, view doctor-created medical records, and store medical documents. Doctors can manage appointments, complete consultations, and maintain their profiles. Administrators can manage users, doctors, departments, appointments, reports, and rescheduling.

## Features

- JWT authentication with bcrypt password hashing
- Role-based access control for patients, doctors, and administrators
- Patient registration, profile management, appointment booking, cancellation, and history
- Doctor appointment management, patient lookup, consultation recording, and profile management
- Admin management of doctors, patients, departments, appointments, contact messages, and reports
- Admin-only appointment rescheduling with future-date and slot-conflict validation
- In-app notifications for appointment booking, status updates, cancellation, and rescheduling
- Medical records created by doctors
- Patient medical document storage with PDF, JPG, JPEG, and PNG upload support
- Search, filtering, dashboard statistics, department reports, CSV export, and print/PDF reports
- Responsive layouts for desktop, tablet, and mobile screens

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript, Font Awesome
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens and bcryptjs
- Uploads: Multer with private local storage
- Email service: Nodemailer configuration is available for contact-message replies

## Why MongoDB

The project uses MongoDB because the implementation was designed around Mongoose document models and references. Healthcare records, appointment metadata, notifications, and uploaded-document metadata can evolve independently, while references preserve the relationships between users, patients, doctors, departments, appointments, and medical records. Replacing MongoDB at this stage would require rewriting the existing models, controllers, queries, seed scripts, and relationship handling, so MongoDB is retained as the project's database implementation.

## Project Structure

```text
Major Project/
	backend/
		config/             MongoDB connection
		controllers/        Request handlers
		middleware/         Authentication, roles, validation, uploads
		models/             Mongoose schemas
		routes/             REST API routes
		services/           Authentication, email, notifications, reports
		seed/               Default landing-page doctors
		server.js           Express application
	frontend/
		index.html          Public landing page
		pages/              Authenticated patient, doctor, and admin pages
		css/                Shared and role-specific styles
		js/                 API, authentication, dashboard, and page logic
		assets/             Images and fonts
docs/                   Supporting project documentation
```

## Requirements

- Node.js 18 or newer
- MongoDB local instance or MongoDB Atlas database
- A static frontend server such as VS Code Live Server or Python HTTP server

## Installation

From `Major Project/backend`:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and provide:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `DEFAULT_DOCTOR_PASSWORD`

Optional email settings are `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD`.

## Run the Application

Start the backend from `Major Project/backend`:

```powershell
npm start
```

The API runs at `http://localhost:5000` by default. Verify it with:

```text
http://localhost:5000/api/health
```

Serve `Major Project/frontend` with VS Code Live Server or another static server. The default CORS setting expects `http://127.0.0.1:5500`; update `FRONTEND_URL` if your frontend server uses another origin.

## Seed Default Doctors

Run this once after configuring MongoDB:

```powershell
npm run seed:default-doctors
```

The command creates or reconciles the three doctors shown on the landing page, their departments, user accounts, and complete doctor profiles. It is safe to run more than once.

Default doctor emails:

- `sunaina.sharma@healsphere.com`
- `shiva.reddy@healsphere.com`
- `kamna.bakshi@healsphere.com`

The password is the value of `DEFAULT_DOCTOR_PASSWORD`; the fallback development password is `HealSphere@123`.

## API Overview

- `/api/auth` - registration, login, current user, logout, password change
- `/api/patients` - patient profiles and patient management
- `/api/doctors` - doctor profiles and doctor management
- `/api/departments` - department CRUD
- `/api/appointments` - booking, lists, status changes, cancellation, admin rescheduling
- `/api/medical-records` - doctor-created records and patient document storage
- `/api/notifications` - authenticated notification inbox and read state
- `/api/reports` - system and appointment statistics
- `/api/contact` - contact messages and admin replies
- `/api/admin` - administrator profile

All protected routes require a bearer token returned by `/api/auth/login`.

## Verification Checklist

- [ ] Backend starts and `/api/health` returns a healthy response.
- [ ] Patient can register, log in, update profile, and change password.
- [ ] Patient can book and cancel an appointment.
- [ ] Doctor sees the booked appointment and can save diagnosis, prescription, and notes.
- [ ] Completed consultation appears in the patient's Medical Records page.
- [ ] Patient can upload, download, and delete a medical document.
- [ ] Admin can update the admin profile.
- [ ] Admin can change appointment status and reschedule active appointments.
- [ ] Patients and doctors receive persisted in-app appointment notifications.
- [ ] Admin reports show totals, status bars, department counts, CSV export, and print/PDF output.
- [ ] Landing page, authentication pages, and dashboards are usable at desktop and mobile widths.

## Security and Deployment Notes

- Never commit `.env`, database credentials, JWT secrets, or uploaded files.
- Uploaded medical documents are stored locally under `backend/uploads/medical-records` and are protected by authenticated download routes. Production deployment should use persistent private storage.
- The frontend currently uses `http://localhost:5000/api` in `frontend/js/api.js`; update this value for a deployed backend.
- Set `NODE_ENV=production` for deployment and use a strong JWT secret.

## Future Enhancements

- Email appointment confirmations and reminders
- Automated browser and API test suites
- Server-side pagination and filtering
- Cloud object storage for medical documents
- Production deployment configuration and API documentation
