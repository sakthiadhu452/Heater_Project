import React from 'react';
import './Login.css'
const Login = ({ onLogin }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://heater-1.onrender.com/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }) // Using username and password here
      });
      
      const responseData = await response.json();
      console.log(responseData)
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        // Redirect to dashboard page
        window.location.replace("/dashboard");
      } else {
        alert("Invalid Credentials")
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error here
    }
  };

  return (
      <div className='container'>
           <div className="login-container">
    <h2>Login</h2>
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
  </div>
      </div>
  
  );
};

export default Login;
