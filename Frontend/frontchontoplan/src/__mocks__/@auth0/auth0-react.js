import React from 'react';

const Auth0Provider = ({ children }) => <div>{children}</div>;

const useAuth0 = () => {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  };
};

export { Auth0Provider, useAuth0 };