// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Logo from "../components/Logo";

// // Страница результатов (заглушка, так как в API нет данных о результатах)
// function Results({ user }) {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();

//   // Заглушка для результатов
//   const mockResults = {
//     score: 9.5,
//     maxScore: 10,
//     tasks: [
//       { id: 1, name: "Задание №1", correct: true },
//       { id: 2, name: "Задание №2", correct: true },
//       { id: 3, name: "Задание №3", correct: true },
//       { id: 4, name: "Задание №4", correct: true },
//       { id: 5, name: "Задание №5", correct: true },
//       { id: 6, name: "Задание №6", correct: true },
//       { id: 7, name: "Задание №7", correct: true },
//       { id: 8, name: "Задание №8", correct: false },
//     ],
//   };

//   return (
//     <div className="page">
//       {/* Логотип вверху по центру */}
//       <div style={{ textAlign: "center", marginBottom: "50px" }}>
//         <Logo />
//       </div>

//       <div style={styles.container}>
//         {/* Блок с оценкой */}
//         <div style={styles.scoreCard}>
//           <h2 style={styles.scoreTitle}>Ваша оценка:</h2>
//           <div style={styles.scoreValue}>
//             {mockResults.score}
//             <span style={styles.scoreDivider}>/</span>
//             {mockResults.maxScore}
//           </div>
//         </div>

//         {/* Список результатов */}
//         <div style={styles.resultsSection}>
//           <h2 style={styles.resultsTitle}>Результат:</h2>
//           <div style={styles.tasksList}>
//             {mockResults.tasks.map((task) => (
//               <div key={task.id} style={styles.taskItem}>
//                 <span>{task.name}</span>
//                 <span
//                   style={{
//                     ...styles.taskStatus,
//                     color: task.correct ? "#10b981" : "#ef4444",
//                   }}
//                 >
//                   {task.correct ? "Верно" : "Неверно"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Кнопка возврата */}
//       <button
//         onClick={() => navigate("/start")}
//         className="button"
//         style={{ maxWidth: "300px", margin: "30px auto", display: "block" }}
//       >
//         Вернуться на главную
//       </button>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "flex-start",
//     gap: "50px",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   },
//   scoreCard: {
//     width: "350px",
//     padding: "40px",
//     border: "2px solid #3d4f5d",
//     borderRadius: "12px",
//     textAlign: "center",
//   },
//   scoreTitle: {
//     fontSize: "24px",
//     marginBottom: "30px",
//     fontWeight: "500",
//   },
//   scoreValue: {
//     fontSize: "80px",
//     fontWeight: "bold",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "15px",
//   },
//   scoreDivider: {
//     fontSize: "60px",
//     color: "#7a8a99",
//   },
//   resultsSection: {
//     flex: 1,
//     maxWidth: "600px",
//   },
//   resultsTitle: {
//     fontSize: "24px",
//     marginBottom: "20px",
//     fontWeight: "500",
//   },
//   tasksList: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "12px",
//   },
//   taskItem: {
//     display: "flex",
//     justifyContent: "space-between",
//     padding: "15px 20px",
//     backgroundColor: "rgba(255, 255, 255, 0.05)",
//     border: "1px solid #3d4f5d",
//     borderRadius: "8px",
//     fontSize: "16px",
//   },
//   taskStatus: {
//     fontWeight: "500",
//   },
// };

// export default Results;

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
          <div
            style={{ color: "#ef4444", marginTop: "30px", fontSize: "18px" }}
          >
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
                    color: answer.right_or_no ? "#10b981" : "#ef4444",
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
    width: "350px",
    padding: "40px",
    border: "2px solid #3d4f5d",
    borderRadius: "12px",
    textAlign: "center",
  },
  scoreTitle: {
    fontSize: "24px",
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
  },
  resultsTitle: {
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "500",
  },
  tasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid #3d4f5d",
    borderRadius: "8px",
    fontSize: "16px",
  },
  taskStatus: {
    fontWeight: "500",
  },
};

export default Results;
