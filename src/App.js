import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import { AuthProvider } from './Context/AuthContext';
import Dashboard from './Pages/Dashboard/Dashboard';
import ProtectedRoute from './Context/ProtectedRoute';
import Profile from './Pages/Profile/Profile';
import Tickets from './Pages/Tickets/Tickets';
import CreateTicket from './Pages/Tickets/CreateTicket';
import SpecificTicket from './Pages/Tickets/SpecificTicket';
import Users from './Pages/Users/Users';
import SpecificUser from './Pages/Users/SpecificUser';
import CreateUser from './Pages/Users/CreateUser';
import Team from './Pages/Teams/Team';
import CreateTeam from './Pages/Teams/CreateTeam'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/:orgId/dashboard" element={  <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
            <Route path="/:orgId/myprofile" element={  <ProtectedRoute>
              <Profile />
            </ProtectedRoute>} />
            <Route path="/:orgId/tickets" element={  <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>} />
            <Route path="/:orgId/create-ticket" element={  <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>} />
            <Route path="/:orgId/create-team" element={  <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>} />
            <Route path="/:orgId/ticket/:id" element={  <ProtectedRoute>
              <SpecificTicket />
            </ProtectedRoute>} />
            <Route path="/:orgId/users" element={  <ProtectedRoute>
              <Users />
            </ProtectedRoute>} />
            <Route path="/:orgId/users/:id" element={  <ProtectedRoute>
              < SpecificUser/>
            </ProtectedRoute>} />
            <Route path="/:orgId/users/new" element={  <ProtectedRoute>
              < CreateUser/>
            </ProtectedRoute>} />
            <Route path="/:orgId/teams" element={  <ProtectedRoute>
              < Team/>
            </ProtectedRoute>} />
            
        </Routes>
      </AuthProvider>
    </Router>      
    
  );
}

export default App;
