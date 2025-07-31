import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/LoginMove");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = () => {
    navigate("/");
  };

  return (
    <div className="log">
      <h1 className="head">Login</h1>
      <form onSubmit={handleLogin} className="flex">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border"
        />
        {error && <p className="red">{error}</p>}
        <button type="submit" className="log_but">Login</button>
        <button
          onClick={handleReturn}
          className="login"
        >
          Exit
        </button>
      </form>
    </div>
  );
}
