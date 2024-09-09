import { Navigate, Route, Routes } from 'react-router-dom'
import { Chart } from './Chart'
import { useLocation} from "react-router-dom";
import { useEffect, useState } from 'react';
import './Home.css'

export function Home() {
    const location = useLocation();

    useEffect(() => {
        // Extract the token from the URL query parameter
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");
    
        if (token) {
          // Store the token (e.g., local storage or state management)
            console.log(token);
            console.log(queryParams.get("email"))
    
        } else {
          // Handle case where token isn't present
          console.error("No token found in the URL");
        }
    }, [location, history]);

    return (
        <div className='container'>
            <div id="balance-card">
            <div>
                <p>My balance</p>
                <h2 id="balance">₦100,560.54</h2>
            </div>
            <Logo />
            </div>
          
            <div id="expense-card">
            <h2>Spending - Last 7 days</h2>
    
            <Chart />
    
            <div id="footer">
                <div>
                <p className='brown'>Total this month</p>
                <h1>₦12,567.64</h1>
                </div>
                <div>
                <p id="percentage">+2.4%</p>
                <p className='brown'>from last month</p>
                </div>
            </div>
            </div>
      </div>
    )
}

const Logo = () => {
    return (
      <div id="logo">
          <svg width="72" height="48" viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd">
          <circle fill="#382314" cx="48" cy="24" r="24"/><circle stroke="#FFF" strokeWidth="2" cx="24" cy="24" r="23"/></g></svg>
      </div>
    )
}