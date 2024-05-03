import React, { useState } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';

function LoginForm() {
    const [sign, setSign] = useState({
      label: "Sign In",
      msg: "Don't have an account? Sign Up"
    });
    
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
      fetch("/test", {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user)
      }).catch((error) => {
        console.log(error);
      });
    }

    function handleAccount() {
      setSign((prevMode) => {
        if(prevMode.label === "Sign In") {
          return {
            label: "Sign Up", msg: "have an account? Sign In"
          }
        }else if(prevMode.label === "Sign Up" ){
          return {
            label: "Sign In",
            msg: "Don't have an account? Sign Up"
        }
      }});
    }

    return (
      <Box 
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
      >
          <Typography component="h1" variant="h5" sx={{fontFamily: "McLaren"}}>
            {sign.label}
          </Typography>
          <Box className="myForm" component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="username"
              autoComplete="email"
              autoFocus
              onChange={handleChange}
              value={user.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
              value={user.password}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {sign.label}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" onClick={handleAccount} variant="body2">
                  {sign.msg}
                </Link>
              </Grid>
            </Grid>
        </Box>
      </Box>

    );

}

export default LoginForm;