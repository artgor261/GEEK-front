import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { register } from "../api";

// Страница регистрации
function Register({ setUser }) {
  const navigate = useNavigate();

  // Поля формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(email, password, confirmPassword);
      setUser(user);
      navigate("/start");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Логотип в верхнем левом углу */}
      <div style={{ position: "absolute", top: "30px", left: "30px" }}>
        <Logo />
      </div>

      <div className="centered-container">
        <div className="form-container">
          <h1 className="form-title">Создать учётную запись</h1>

          {/* Сообщение об ошибке */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Поле email */}
            <input
              type="email"
              className="input-field"
              placeholder="Адрес электронной почты..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Поле пароля */}
            <input
              type="password"
              className="input-field"
              placeholder="Пароль..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Поле подтверждения пароля */}
            <input
              type="password"
              className="input-field"
              placeholder="Подтвердить пароль..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Кнопка регистрации */}
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Загрузка..." : "Продолжить"}
            </button>
          </form>

          {/* Ссылка на страницу входа */}
          <div className="form-footer">
            У вас уже есть учётная запись? <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
