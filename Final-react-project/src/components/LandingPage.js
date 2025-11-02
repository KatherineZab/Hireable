import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { useState } from 'react';
import axios from 'axios';

function LandingPage() {
  const navigate = useNavigate();

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [LogMessage, setLogMessage] = useState("");


  const handleLogIn = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        data: {
          email: email,
          password: password,
        },
      });
      if (response.data.answer) {
          localStorage.setItem('userId', response.data.user._id); 
          window.dispatchEvent(new Event('storage'));
          navigate('/home'); 
        }
      setLogMessage(response.data.message );
     
    } catch (error) {
      console.error(error);
      setLogMessage(error.response?.data?.message );
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogIn();
    console.log('Login attempt:', email,password);
  };

  
  return (
    <div className="landing-wrapper">
      <div className="landing-content">
        {LogMessage && (
          <div
            style={{
              fontSize: 22,
              color:  "red",
            }}
          >
            {LogMessage}
          </div>
        )}
        <h1>Welcome to Hireable</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email} 
              onChange={e => {setEmail(e.target.value); setLogMessage(null)}}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password} 
              onChange={e => {setPassword(e.target.value);setLogMessage(null)}}
              required
            />
          </div >
          <div className="button-group">
           <button type="submit" className="auth-button">Login</button>
            <button type="button" className="auth-button" onClick={() => navigate('/register')}>Registeration</button>
          </div >
        </form>
      </div>
    </div>
  )
}
export default LandingPage; 