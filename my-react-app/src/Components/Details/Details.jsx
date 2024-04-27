import React, { useState, useEffect } from 'react';
import './Details.css'; // Import CSS for styling
import { Link } from 'react-router-dom';

const Toggle = () => {
  // State variables
  const [status, setStatus] = useState(false); // Initial status is off
  const [temperature, setTemperature] = useState('0');
  const [operation, setOperation] = useState("auto");

  // Fetch status from server
  const fetchStatus = async () => {
    try {
      const response = await fetch('https://heater-1.onrender.com/getStatus');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Fetch temperature from server
  const fetchTemp = async () => {
    try {
      const response = await fetch("https://heater-1.onrender.com/getTemp");
      const data = await response.json();
      setTemperature(data.temp);
    } catch (error) {
      console.error('Error fetching Temperature:', error);
    }
  };

  // Toggle heater status
  const toggleStatus = async () => {
    try {
      const mode = operation === 'auto' ? 'auto' : 'manual';
      
      const resp = await fetch('http://localhost:4000/changeMode', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "mode": mode }) // Send mode in the request body
      });

      if (!resp.ok) {
        console.error('Error:', resp.statusText); // Handle any HTTP error
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Send post request when operation changes to auto or manual
  useEffect(() => {
    if (operation === 'auto' || operation === 'manual') {
      const sendModeRequest = async () => {
        try {
          const resp = await fetch('https://heater-1.onrender.com/changeMode', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode: operation })
          });
  
          if (!resp.ok) {
            console.error('Error:', resp.statusText); // Handle any HTTP error
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
  
      sendModeRequest();
    }
  }, [operation]);

  useEffect(() => {
    const statusInterval = setInterval(fetchStatus, 1000); // Fetch status every second
    const tempInterval = setInterval(fetchTemp, 1000); // Fetch temperature every second

    return () => {
      clearInterval(statusInterval); // Cleanup function to clear the status interval when component unmounts
      clearInterval(tempInterval); // Cleanup function to clear the temperature interval when component unmounts
    };
  }, []);

  return (
    <div className="toggle-container">
      <div className='Temp'>
        <span>Temperature: </span>
        {temperature} °C</div>
      <div className='radio'>
        <input type="radio" id="auto" name="operation" value="auto" checked={operation === "auto"} onChange={() => {setOperation("auto"),toggleStatus()}} />
        <label htmlFor="auto">Auto</label>
        <input type="radio" id="manual" name="operation" value="manual" checked={operation === "manual"} onChange={() => {setOperation("manual"),toggleStatus()}} />
        <label htmlFor="manual">Manual</label>
      </div>
      <div className={`status ${status === 'ON' ? 'on' : 'off'}`}>{status === 'ON' ? 'ON' : 'OFF'}</div>
      <div className="buttons">
        <button onClick={toggleStatus} className={`toggle-button ${status === 'ON' ? 'on' : 'off'}`}>
          {status === 'ON' ? 'Turn Off' : 'Turn On'}
        </button>
        {/* You can add another button here for more functionalities */}
      </div>
      <Link style={{ marginTop: "30px" }} to="/Todisplay">Details&gt;</Link>
    </div>
  );
};

export default Toggle;
