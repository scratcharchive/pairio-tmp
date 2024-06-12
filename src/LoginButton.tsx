import React from 'react';
import useGitHubAccessToken from './useGitHubAccessToken';

const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
const redirectUri = 'https://pairio.vercel.app/api/auth';
export const loginUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;

const LoginButton: React.FC = () => {
  const { accessToken, clearAccessToken, userId } = useGitHubAccessToken();

  if (!accessToken) {
    return <a href={loginUrl}>Login with GitHub</a>
  }
  else {
    return (
      <div>
        <p>Logged in as {userId}</p>
        <button onClick={clearAccessToken}>Log out</button>
      </div>
    );
  }
}

export default LoginButton;
