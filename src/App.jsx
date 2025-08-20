import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 1. Import our new custom theme
import theme from './theme'; 

// Import our Layout component
import Layout from './components/layout/Layout';

// Import all page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProfile from './pages/CreateProfile';
import Appraisal from './pages/Appraisal';
import HodDashboard from './pages/HodDashboard';
import HodReview from './pages/HodReview';
import PrincipalDashboard from './pages/PrincipalDashboard';
import PrincipalView from './pages/PrincipalView';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    // 2. Provide our custom theme to the entire application
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-profile" element={<CreateProfile />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appraisal" element={<Appraisal />} />
          <Route path="/hod-dashboard" element={<HodDashboard />} />
          <Route path="/hod/review/:appraisalId" element={<HodReview />} />
          <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
          <Route path="/principal/view/:appraisalId" element={<PrincipalView />} />
          <Route path="/principal/user-management" element={<UserManagement />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </ThemeProvider>
  );
}

export default App;