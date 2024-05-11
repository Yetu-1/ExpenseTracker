import {React, useState} from "react"

function SignUp() {
    const [user, setUser] = useState({
        username: '',
        password: '',
    });

    function handleChange(event) {
        const {name, value} = event.target;
        setUser((prevData) => {
          return {
            ...prevData, [name]: value
          }
        });  
    }

    function handleSubmit() {
        console.log(user);
        fetch("http://localhost:4000/login", {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(user)
        }).catch((error) => {
          console.log(error);
        });
    }

    function googleLogin() {
        // event.preventDefault();
        const str = `http://localhost:4000/auth/google`;
        window.open(str, "_self");
    };
      
    return (
        <div class="form">
        <div class="form-input">
            <header class="form-header">
                <h1>Create a new Account</h1>
                <p>The future of Expense Tracking</p>
            </header>

            <div class="input">
                <label>Email</label>
                <input name="username" type="email" onChange={handleChange} value={user.username}/>
            </div>
            <div class="input">
                <label>Password</label>
                <input name="password"  type="password" onChange={handleChange} value={user.password}/>
            </div>

            <button onClick={handleSubmit} >LOG IN</button>
        </div>
        <p>Don't have an account? Register</p>
        <p>Forgot Password?</p>

        </div>
    );
}

export default SignUp;