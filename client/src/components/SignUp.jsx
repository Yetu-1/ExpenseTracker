import React from "react"

function SignUp() {

    return (
        <div class="form">
        <div class="form-input">
            <header class="form-header">
                <h1>Create a new Account</h1>
                <p>The future of Expense Tracking</p>
            </header>

            <div class="input">
                <label>Email</label>
                <input></input>
            </div>
            <div class="input">
                <label>Password</label>
                <input></input>
            </div>

            <button>LOG IN</button>
        </div>
        <p>Don't have an account? Register</p>
        <p>Forgot Password?</p>

        </div>
    );
}

export default SignUp;