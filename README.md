# Faculty Appraisal System

This is a web application for a Faculty Appraisal System. It allows faculty members to submit their appraisal forms, and provides a workflow for HODs and Principals to review and approve them.

**Website link:** [fas-mitm.netlify.app](https://fas-mitm.netlify.app)

## Features

- **Faculty Dashboard:** View appraisal status and submit new appraisal forms.
- **HOD Dashboard:** Review and approve appraisal forms submitted by faculty in their department.
- **Principal Dashboard:** View all appraisal forms, manage users, and have the final say in the appraisal process.
- **Role-based Access Control:** Different views and permissions for Faculty, HOD, and Principal roles.
- **User Management:** Principals can manage user accounts and roles.
- **Appraisal Form:** A detailed form for faculty to fill out their achievements and performance.

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [Material-UI](https://mui.com/)
  - [React Router](https://reactrouter.com/)
- **Backend:**
  - [Supabase](https://supabase.io/) (for database and authentication)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed on your machine.
- A Supabase account and a new project created.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/faculty-appraisal-system.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a `.env` file in the root of the project and add your Supabase project URL and anon key:
   ```
   VITE_SUPABASE_URL=YOUR_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
4. Start the development server
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:5173`.
