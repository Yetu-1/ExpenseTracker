import React, {useEffect, useState} from "react"
import LoginForm from "./LoginForm";

function App() {
  const [userData, setUserData] = useState({});
  
  useEffect(() => {
    fetch("/api").then((response) => {
      return response.json()
    }).then((data) => {
      setUserData(data)
    })
  }, []); // Pass in an empty array so this runs only on the first render of the componenet

  return (
    <div>   
      <LoginForm />     
      {/* <h1>Home</h1>
      <p>First Name: {(typeof userData.fName === 'undefined')? (<p>Loading...</p>) : userData.fName} </p>
      <p>Last Name: {(typeof userData.fName === 'undefined')? (<p>Loading...</p>) : userData.lName}</p>
      <img src={(typeof userData.fName === 'undefined')? "null": userData.img} />  */}
    </div>
  );
}

export default App;
