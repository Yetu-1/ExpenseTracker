import { Navigate, Route, Routes } from 'react-router-dom'
import { Chart } from './Chart'
import { useLocation} from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css'

type User = {
    firstname: string
    lastname: string
    email: string
    token: string
 }
type Account = {
    account: string
}
export function Home() {
    const location = useLocation();
    const [user, setUser] = useState<User>({
        firstname: "",
        lastname: "",
        email: "",
        token: ""
    });
    const [balance, setBalance] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [lastExpenses, setLastExpenses] = useState([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currAccount, setCurrentAccount] = useState("All");
    const [percentIncrease, setPercentIncrease] = useState(0);
    
    const fetchData = async ( currUser : User, currAccount: string) => {
        const config = {
            headers: {
                Authorization: `Bearer ${currUser.token}`,
            },
        };
        
        try {
            //const response = await axios.get('http://localhost:3000/', config);
            const response = await axios.post('http://localhost:3000/', {current_account: currAccount}, config);
            console.log(response.data);
            const balance = response.data.balance;
            setBalance(balance)
            const month_expenses = response.data.expenses;
            setExpenses(month_expenses);
            setLastExpenses(response.data.last_expenses);
            setAccounts(response.data.accounts);
            setCurrentAccount(response.data.current_account);
            setPercentIncrease(response.data.percent_increase);
        } catch (error) {
            console.error('Error fetching data:', error);
        }

    }

    useEffect(() => {
        // Extract the token from the URL query parameter
        const queryParams = new URLSearchParams(location.search);

        const currentUser : User = {
            firstname: String(queryParams.get("firstname")),
            lastname: String(queryParams.get("lastname")),
            email: String(queryParams.get("email")),
            token: String(queryParams.get("jwt"))
        }
        if (currentUser.token) {
            // Store the token (e.g., local storage or state management)
            console.log(currentUser);
            setUser(currentUser);
    
        } else {
          // Handle case where token isn't present
          console.error("No token found in the URL");
        }
        
        fetchData(currentUser, currAccount);
    },[location]);

    return (
        <div className='container'>
            <div id="balance-card">
            <div>
                <p>My balance</p>
                <h2 id="balance">₦{balance.toLocaleString()}</h2>
                <div id="accounts-card">
                    <div className="account-button" id="all-accounts-button" onClick={()=> {fetchData(user, "All")}} 
                        style={{backgroundColor: (currAccount=="All")? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}}>
                        <p>All</p>
                    </div>
                    {accounts.map((account) => {
                        function handleClick() {
                            fetchData(user, account.account);
                        }
                        return (
                            <div key={account.account} className="account-button" onClick={handleClick} 
                                style={{backgroundColor: (currAccount==account.account)? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}}>
                                <p>{account.account}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Logo />
            </div>
          
            <div id="expense-card">
            <h2>Spending - Last 7 days</h2>
    
            <Chart expenses={lastExpenses}/>
    
            <div id="footer">
                <div>
                <p className='brown'>Total this month</p>
                <h1>₦{expenses.toLocaleString()}</h1>
                </div>
                <div>
                <p id="percentage">{percentIncrease < 0? '' : '+'}{percentIncrease.toPrecision(3)}%</p>
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

const AccountButton = () => {
    <div className="account-button">
        <p></p>
    </div>
}

// TODO: make my own comma-number maker (i.e turn a number to the comma number version e.g 1000 to 1,000)
const comma_number = (num : number) => {

}