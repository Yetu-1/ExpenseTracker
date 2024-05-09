import React, {useEffect, useState, useContext} from "react"
import LoginForm from "./LoginForm";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserContext } from "./components/UserContext";

function App() {
  const [userData, setUserData] = useState({});
  
  useEffect(() => {
    fetch("/api").then((response) => {
      return response.json()
    }).then((data) => {
      setUserData(data)
    })
  }, []); // Pass in an empty array so this runs only on the first render of the componenet
  function googleLogin() {
    // event.preventDefault();
    const str = `http://localhost:4000/auth/google`;
    window.open(str, "_self");
  };

  // access the user object in UserContex.jsx
  const user = useContext(UserContext)
  return (
      <div>   
        <LoginForm /> 
        <h1>Home</h1> 
        <p>First Name: {(typeof userData.fName === 'undefined')? (<p>Loading...</p>) : userData.fName} </p>
        <p>Last Name: {(typeof userData.fName === 'undefined')? (<p>Loading...</p>) : userData.lName}</p>
        <img src={(typeof userData.fName === 'undefined')? "null": userData.img} alt="profile" /> 
        <button onClick={googleLogin}>
      Sign in with Google
    </button>
      {/* {user?.loggedIn? <h1>loggedIn</h1> : <h1>loggedOut</h1>} */}
      </div>
  );
}

export default App;
