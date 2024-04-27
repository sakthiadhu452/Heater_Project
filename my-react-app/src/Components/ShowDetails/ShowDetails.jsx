import React, { useState, useEffect } from 'react';
import './ShowDetails.css';

const ShowDetails = () => {
  // State variables for start date and end date
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State variable to store the fetched data
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const resp = await fetch("https://heater-1.onrender.com/getTimmings", {
        method: "POST",
        headers: {
          'Accept': "application/json",
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate
        })
      });

      if (resp.ok) {
        const responseData = await resp.json();
        // Convert ISO format time to date and time components
        const formattedData = responseData.resp.map(item => ({
          ...item,
          time: {
            date: new Date(item.time).toLocaleDateString(),
            time: new Date(item.time).toLocaleTimeString()
          }
        }));
        setData(formattedData); // Update the state with fetched data
      } else {
        console.error('Error fetching data:', resp.status);
        // Handle error response
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle fetch error
    }
  };

  // Effect hook to fetch data when start date or end date changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchData(); // Fetch data when both start date and end date are provided
    }
  }, [startDate, endDate]);

  return (
    <div className="container-sh">
      <h2>Show Details</h2>
      <div className="input-container">
        <label htmlFor="start-date">Start Date:</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="input-container">
        <label htmlFor="end-date">End Date:</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {/* Display fetched data */}
      <div>
        <h3>Fetched Data</h3>
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <p className={(item.status=='ON')? 'ONc': 'OFFc'}>Status: {item.status}</p>
              <p>Date: {item.time.date}</p>
              <p>Time: {item.time.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShowDetails;
