import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Login from './Pages/auth/Login';
import Dashboard from './Pages/dashboard/Dashboard';
import StudentList from './Pages/students/StudentList';
import FacultyList from './Pages/faculty/FacultyList';
import UserManagement from './Pages/users/UserManagement';
import EventList from './Pages/events/EventList';
import Venue from './Pages/venues/Venue';
import Registration from './Pages/registrations/Registration';
import Attendance from './Pages/attendance/Attendance';
import Marks from './Pages/marks/Marks';
import Assignment from './Pages/assignments/Assignment';
import StudyMaterial from './Pages/studymaterials/StudyMaterial';
import Announcement from './Pages/announcements/Announcement';
import ClubList from './Pages/clubs/ClubList';
import Profile from './Pages/profile/Profile';
import Settings from './Pages/settings/Settings';

// roles is optional — omit it to allow any logged-in user
const Protected = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Open to any logged-in role */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />

          {/* Academic records — Admin + Faculty manage, Student/Coordinator can view via the page's own read-only logic */}
          <Route path="/students" element={<Protected roles={['ADMIN', 'FACULTY']}><StudentList /></Protected>} />
          <Route path="/faculty" element={<Protected roles={['ADMIN']}><FacultyList /></Protected>} />
          <Route path="/users" element={<Protected roles={['ADMIN']}><UserManagement /></Protected>} />
          <Route path="/attendance" element={<Protected roles={['ADMIN', 'FACULTY', 'STUDENT']}><Attendance /></Protected>} />
          <Route path="/marks" element={<Protected roles={['ADMIN', 'FACULTY', 'STUDENT']}><Marks /></Protected>} />
          <Route path="/assignments" element={<Protected roles={['ADMIN', 'FACULTY', 'STUDENT']}><Assignment /></Protected>} />
          <Route path="/materials" element={<Protected roles={['ADMIN', 'FACULTY', 'STUDENT']}><StudyMaterial /></Protected>} />

          {/* Campus / events — Admin + Event Coordinator manage, everyone else can view */}
          <Route path="/events" element={<Protected roles={['ADMIN', 'STUDENT', 'EVENT_COORDINATOR']}><EventList /></Protected>} />
<Route path="/venues" element={<Protected roles={['ADMIN', 'EVENT_COORDINATOR']}><Venue /></Protected>} />
<Route path="/registrations" element={<Protected roles={['ADMIN', 'STUDENT', 'EVENT_COORDINATOR']}><Registration /></Protected>} />
<Route path="/clubs" element={<Protected roles={['ADMIN', 'STUDENT', 'EVENT_COORDINATOR']}><ClubList /></Protected>} />
<Route path="/announcements" element={<Protected><Announcement /></Protected>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;