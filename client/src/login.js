import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

function SignIn() {
  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      // Send the authorization code to the backend server
      fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeResponse.code }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Backend response:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },
    onError: () => {
      // Handle login errors here
      console.error('Google login failed');
    },
    flow: 'auth-code',
  });

  return (
    <button onClick={() => googleLogin()}>
      Sign in with Google
    </button>
  );
}

export default SignIn;