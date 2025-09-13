import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
