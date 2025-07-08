import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Register from './Pages/Users/Register';
import Login from './Pages/Users/Login';
import OtpVerification from './Pages/Users/OtpVerification';
import MainLayout from './MainLayout';
import Dashboard from './Pages/Dashboard/Dashboard';
import Profile from './Pages/Profile/Profile';
import Ticket from './Pages/Ticket/Ticket';
import SpecificTicket from './Pages/Ticket/SpecificTicket';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/register' element={<Register/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path="/opt-verification" element={<OtpVerification/>}></Route>
            <Route path="/home" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/my-profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/tickets" element={<MainLayout><Ticket /></MainLayout>} />
            <Route path="/ticket/:id" element={<MainLayout><SpecificTicket/></MainLayout>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
