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
    <div className="page" style={styles.page}>
      {/* Логотип вверху по центру */}
      <div style={styles.logoContainer}>
        <img src="/white_logo.png" alt="Logo" style={styles.logoImage} />
      </div>

      {/* Основной контейнер с результатами */}
      <div style={styles.container}>
        {/* Блок с оценкой (слева) */}
        <div style={styles.scoreSection}>
          <div style={styles.scoreCard}>
            <h2 style={styles.scoreTitle}>Ваша оценка:</h2>
            <div style={styles.scoreDisplay}>
              <span style={styles.scoreValue}>{results.score}</span>
              <div style={styles.scoreDivider}></div>
              <span style={styles.scoreMax}>{maxScore}</span>
            </div>
          </div>
        </div>

        {/* Блок с результатами (справа) */}
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>Результат:</h2>
          </div>

          <div style={styles.tasksList}>
            {results.answers.map((answer, index) => (
              <div key={answer.id} style={styles.taskItem}>
                <span style={styles.taskNumber}>Задание №{index + 1}</span>
                <span
                  style={{
                    ...styles.taskStatus,
                    color: answer.right_or_no ? "#D9FFFA" : "#D9FFFA",
                  }}
                >
                  {answer.right_or_no ? "Верно" : "Неверно"}
                </span>
              </div>
            ))}
          </div>

          {/* Скроллбар с кастомным дизайном */}
          {results.answers.length > 7 && (
            <div style={styles.scrollbarContainer}>
              <div style={styles.scrollbarTrack}>
                <div style={styles.scrollbarThumb}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Кнопка возврата */}
      <button
        onClick={() => navigate("/start")}
        className="button"
        style={styles.backButton}
      >
        Вернуться на главную
      </button>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0",
    height: "100vh",
    overflow: "hidden",
  },
  logoContainer: {
    marginTop: "30px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    maxWidth: "200px",
    height: "auto",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "80px",
    maxWidth: "1400px",
    width: "100%",
    padding: "0 50px",
    marginTop: "20px",
    flex: 1,
  },
  scoreSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreCard: {
    width: "505px",
    height: "471px",
    border: "1px solid #D9FFFA",
    borderRadius: "10px",
    backgroundColor: "#111F25",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    position: "relative",
  },
  scoreTitle: {
    fontSize: "48px",
    fontWeight: "600",
    color: "#D9FFFA",
    textAlign: "center",
    margin: "0 0 60px 0",
    position: "absolute",
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
  },
  scoreDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    position: "relative",
    marginTop: "40px",
  },
  scoreValue: {
    fontSize: "96px",
    fontWeight: "600",
    color: "#D9FFFA",
    lineHeight: "1",
    position: "relative",
    right: "30px",
  },
  scoreDivider: {
    width: "5px",
    height: "183px",
    backgroundColor: "#D9FFFA",
    transform: "rotate(44.32deg)",
    position: "relative",
    margin: "0 20px",
  },
  scoreMax: {
    fontSize: "96px",
    fontWeight: "600",
    color: "#D9FFFA",
    lineHeight: "1",
    position: "relative",
    left: "30px",
  },
  resultsSection: {
    display: "flex",
    flexDirection: "column",
    minWidth: "514px",
    maxWidth: "514px",
    position: "relative",
  },
  resultsHeader: {
    marginBottom: "20px",
  },
  resultsTitle: {
    fontSize: "48px",
    fontWeight: "600",
    color: "#D9FFFA",
    margin: "0",
  },
  tasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxHeight: "450px",
    overflowY: "auto",
    paddingRight: "15px",
    scrollbarWidth: "thin",
    scrollbarColor: "#D9FFFA transparent",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 22px",
    height: "49px",
    backgroundColor: "#111F25",
    border: "1px solid #D9FFFA",
    borderRadius: "10px",
    fontSize: "20px",
    color: "#D9FFFA",
  },
  taskNumber: {
    fontSize: "20px",
    color: "#D9FFFA",
  },
  taskStatus: {
    fontSize: "20px",
    fontWeight: "500",
  },
  scrollbarContainer: {
    position: "absolute",
    right: "0",
    top: "75px",
    height: "450px",
    width: "1px",
  },
  scrollbarTrack: {
    width: "1px",
    height: "100%",
    backgroundColor: "#D9FFFA",
    position: "relative",
  },
  scrollbarThumb: {
    width: "11px",
    height: "11px",
    backgroundColor: "#D9FFFA",
    borderRadius: "50%",
    position: "absolute",
    left: "50%",
    top: "10px",
    transform: "translateX(-50%)",
  },
  backButton: {
    maxWidth: "300px",
    margin: "20px auto 20px auto",
    display: "block",
  },
};

export default Results;
