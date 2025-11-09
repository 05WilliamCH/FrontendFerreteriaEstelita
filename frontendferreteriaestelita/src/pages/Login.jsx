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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/usuarios/login`, {
        email,
        password,
      });

        // ✅ Extraer datos del usuario
      const { token, usuario } = res.data;

       // ✅ Guardamos token, rol e idusuario en localStorage con el hook useAuth
      login(token, usuario.idrol, usuario.idusuario, usuario.nombre);
    } catch (err) {
      console.error(err);
      // ✅ Mostrar mensaje de error personalizado si el backend lo envía
    if (err.response && err.response.data && err.response.data.error) {
      setError(`❌ ${err.response.data.error}`);
    } else {
      setError("❌ Usuario o contraseña incorrectos");
    }
    }
  };

  const [mostrarPassword, setMostrarPassword] = useState(false);


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
               type={mostrarPassword ? "text" : "password"}
              className="form-control border-0 border-bottom shadow-sm"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-group-text bg-white border-0"
              style={{ cursor: "pointer" }}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              <i className={mostrarPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
            </span>
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
