import React, {useState, useEffect} from "react"

function App() {
  const [user, setUser] = useState({});
  const [response, setResponse] = useState({});
  const [token, setToken] = useState();
  
  function onSubmit() {
    setUser({username: 'davidyetu1000@gmail.com', password: 'hello'});

    fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(json => setResponse(json));

    if(response.user){
      setToken(response.user.accessToken);
      console.log(token)
    }
    console.log(response);
  }

  function onfetch() {

    fetch('http://localhost:4000/home', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    .then(json => console.log(json));
  }

  return (
    <div>
    <h1>Hello world</h1>
    <button onClick={onSubmit}>Register</button>
    <button onClick={onfetch}>Get Data</button>

    </div>
  );
}

export default App;
