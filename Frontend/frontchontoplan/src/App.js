import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/components-login/Login.jsx';
import Home from './components/component-home/Home.jsx';
import ActiveCount from './components/component-active-count/activeCount.jsx';
import Alerta from './components/component-alert/Alerta.jsx';



function App() {
  return (
    <Router>
      <Alerta />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/confirm_singup" element={<ActiveCount />} />
      </Routes>
    </Router>
  );
}

export default App;
