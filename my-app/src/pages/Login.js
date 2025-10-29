import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { login, checkSession } from "../api";

// Страница входа
function Login({ setUser }) {
  const navigate = useNavigate();

  // Поля формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Проверка существующей сессии при загрузке компонента
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const sessionData = await checkSession();
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user);
          navigate("/start");
        }
      } catch (err) {
        // Если проверка сессии не удалась, просто показываем форму входа
        console.error("Session check failed:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate, setUser]);

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/start");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Показываем загрузку во время проверки сессии
  if (checkingSession) {
    return (
      <div className="page">
        <div className="centered-container">
          <div className="form-container">
            <p>Проверка сессии...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Логотип в верхнем левом углу */}
      <div style={{ position: "absolute", top: "30px", left: "30px" }}>
        <Logo />
      </div>

      <div className="centered-container">
        <div className="form-container">
          <h1 className="form-title">Вход в аккаунт</h1>

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

            {/* Кнопка входа */}
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Загрузка..." : "Продолжить"}
            </button>
          </form>

          {/* Ссылка на страницу регистрации */}
          <div className="form-footer">
            <a href="/register">Регистрация</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
