import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import UserProfile from "../components/UserProfile";
import { startAttempt } from "../api";

// Страница старта тестирования
function StartTest({ user }) {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Обработка старта тестирования
  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Пока что используем тест с ID = 1 (можно сделать выбор теста позже)
      const testId = 1;
      const attempt = await startAttempt(testId, code);

      // Переходим на страницу тестирования
      navigate(`/testing/${attempt.id}`);
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

      {/* Профиль пользователя в верхнем правом углу */}
      <div style={{ position: "absolute", top: "30px", right: "30px" }}>
        <UserProfile user={user} />
      </div>

      <div className="centered-container">
        <div style={{ maxWidth: "700px", width: "100%" }}>
          <h1 style={styles.title}>Добро пожаловать на тестирование!</h1>

          {/* Информация о тесте */}
          <ul style={styles.infoList}>
            <li>
              Сейчас вы пройдете тест, который проверит Ваши умения пользоваться
              различными известными ИИ моделями.
            </li>
            <li>
              Вам будет предложено решить 7 вопросов. На решение теста Вам будет
              дано 2 часа.
            </li>
            <li>Перед началом введите свой специальный код.</li>
          </ul>

          {/* Сообщение об ошибке */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleStart}>
            {/* Поле для ввода кода */}
            <input
              type="text"
              className="input-field"
              placeholder="Введите свой код..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ fontSize: "18px", textAlign: "center" }}
              required
            />

            {/* Кнопка старта */}
            <button
              type="submit"
              className="button"
              disabled={loading}
              style={{
                maxWidth: "300px",
                margin: "20px auto",
                display: "block",
              }}
            >
              {loading ? "Загрузка..." : "Начать тестирование"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: "32px",
    textAlign: "center",
    marginBottom: "40px",
    fontWeight: "500",
  },
  infoList: {
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "40px",
    paddingLeft: "20px",
  },
};

export default StartTest;
