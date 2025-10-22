import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { getAttemptResults } from "../api";

// Страница результатов
function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // Состояние для результатов
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загрузка результатов при монтировании компонента
  useEffect(() => {
    loadResults();
  }, [attemptId]);

  // Функция загрузки результатов
  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await getAttemptResults(attemptId);
      setResults(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Показываем загрузку
  if (loading) {
    return <div className="loading">Загрузка результатов...</div>;
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Logo />
          <div style={{ color: "white", marginTop: "30px", fontSize: "18px" }}>
            Ошибка загрузки результатов: {error}
          </div>
          <button
            onClick={() => navigate("/start")}
            className="button"
            style={{ maxWidth: "300px", margin: "30px auto", display: "block" }}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Подсчёт максимального балла (если нужно)
  const maxScore = 100; // Можно получить из теста, если нужно

  return (
    <div className="page">
      {/* Логотип вверху по центру */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <Logo />
      </div>

      <div style={styles.container}>
        {/* Блок с оценкой */}
        <div style={styles.scoreCard}>
          <h2 style={styles.scoreTitle}>Ваша оценка:</h2>
          <div style={styles.scoreValue}>
            {results.score}
            <span style={styles.scoreDivider}>/</span>
            {maxScore}
          </div>
        </div>

        {/* Список результатов */}
        <div style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>Результат:</h2>
          <div style={styles.tasksList}>
            {results.answers.map((answer, index) => (
              <div key={answer.id} style={styles.taskItem}>
                <span>Задание №{index + 1}</span>
                <span
                  style={{
                    ...styles.taskStatus,
                  }}
                >
                  {answer.right_or_no ? "Верно" : "Неверно"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка возврата */}
      <button
        onClick={() => navigate("/start")}
        className="button"
        style={{ maxWidth: "300px", margin: "30px auto", display: "block" }}
      >
        Вернуться на главную
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "50px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  scoreCard: {
    width: "505px",
    height: "435px",
    padding: "40px",
    border: "1px solid #D9FFFA",
    borderRadius: "12px",
    textAlign: "center",
    marginTop: "50px",
  },
  scoreTitle: {
    fontSize: "48px",
    marginBottom: "30px",
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: "80px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
  },
  scoreDivider: {
    fontSize: "60px",
    color: "#7a8a99",
  },
  resultsSection: {
    flex: 1,
    maxWidth: "600px",
    width: "514px",
    marginTop: "15px",
  },
  resultsTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    fontWeight: "500",
  },
  tasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    backgroundColor: "#111F25",
    border: "1px solid #D9FFFA",
    borderRadius: "8px",
    fontSize: "16px",
    height: "49px",
  },
  taskStatus: {
    fontWeight: "500",
  },
};

export default Results;
