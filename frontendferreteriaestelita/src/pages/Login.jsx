import React, { useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      setError("❌ Solo se permiten correos @gmail.com");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/usuarios/login", {
        email,
        password,
      });

        // ✅ Extraer datos del usuario
      const { token, usuario } = res.data;

       // ✅ Guardamos token, rol e idusuario en localStorage con el hook useAuth
      login(token, usuario.idrol, usuario.idusuario, usuario.nombre);
    } catch (err) {
      console.error(err);
      setError("❌ Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="login-card p-5 shadow-lg rounded-4">
        <div className="text-center mb-4">
          <img src="/ESTELITA.jpeg" alt="Logo" className="logo-img mb-3" />
          <h4 className="fw-bold">FERRETERÍA LA ESTELITA</h4>
          <p className="text-muted small">Acceso al sistema administrativo</p>
        </div>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group custom-input">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control border-0 border-bottom shadow-sm"
              placeholder="CORREO (solo Gmail)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 input-group custom-input">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              className="form-control border-0 border-bottom shadow-sm"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-gradient w-100 fw-bold">
            INICIAR SESIÓN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
