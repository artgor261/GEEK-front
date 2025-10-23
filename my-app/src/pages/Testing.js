import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import UserProfile from "../components/UserProfile";
import {
  getAttemptQuestions,
  postAnswer,
  submitAttempt,
  createAIDialogue,
  sendAIMessage,
} from "../api";

// Страница тестирования
function Testing({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const chatEndRef = useRef(null);

  // Состояние данных
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [llmQuery, setLlmQuery] = useState("");
  const [llmMessages, setLlmMessages] = useState([]);
  // const [llmModel, setLlmModel] = useState("ChatGPT");
  // const [showModelList, setShowModelList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Состояние для работы с LLM
  // Храним threadId для каждого вопроса отдельно
  const [threadIds, setThreadIds] = useState({}); // { questionIndex: threadId }
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");

  // Получаем threadId для текущего вопроса
  const currentThreadId = threadIds[currentQuestionIndex];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [llmMessages, isLlmLoading]);

  // Загрузка вопросов при монтировании компонента
  useEffect(() => {
    loadQuestions();
  }, [attemptId]);

  // Создание диалога с LLM для текущего вопроса (если ещё не создан)
  useEffect(() => {
    if (questions.length > 0 && !currentThreadId) {
      initializeLlmDialogue();
    }
  }, [currentQuestionIndex, questions, currentThreadId]);

  // Очистка истории сообщений при смене вопроса
  useEffect(() => {
    // Очищаем историю чата при переходе на другой вопрос
    setLlmMessages([]);
  }, [currentQuestionIndex]);

  // Функция загрузки вопросов
  const loadQuestions = async () => {
    try {
      const data = await getAttemptQuestions(attemptId);
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Функция инициализации диалога с LLM для текущего вопроса
  const initializeLlmDialogue = async () => {
    try {
      setLlmError("");

      // Создаём диалог для текущего вопроса
      const questionPosition = currentQuestionIndex + 1;
      const dialogue = await createAIDialogue(attemptId, questionPosition);

      // Сохраняем threadId для этого конкретного вопроса
      setThreadIds((prev) => ({
        ...prev,
        [currentQuestionIndex]: dialogue.thread_id,
      }));

      console.log(
        `Диалог с LLM создан для вопроса ${questionPosition}:`,
        dialogue
      );
    } catch (err) {
      console.error("Ошибка создания диалога с LLM:", err);
      setLlmError(err.message);
    }
  };

  // Отправка ответа на вопрос
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!userAnswer.trim()) {
      alert("Пожалуйста, введите ответ");
      return;
    }

    try {
      const question = questions[currentQuestionIndex];
      // Отправляем позицию вопроса (индекс + 1), а не ID
      const questionPosition = currentQuestionIndex + 1;
      await postAnswer(attemptId, questionPosition, userAnswer);

      setSubmittedAnswers((prev) => ({
        ...prev,
        [question.id]: userAnswer,
      }));

      // Очищаем поле ответа
      setUserAnswer("");
      // Проверяем, является ли это последним вопросом
      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (isLastQuestion) {
        // Если это последний вопрос, завершаем тестирование и переходим к результатам
        try {
          await submitAttempt(attemptId);
          alert("Тестирование завершено!");
          navigate(`/results/${attemptId}`);
        } catch (err) {
          alert(`Ошибка завершения тестирования: ${err.message}`);
        }
      } else {
        alert("Ответ сохранён");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Завершение тестирования
  const handleFinish = async () => {
    if (window.confirm("Вы уверены, что хотите завершить тестирование?")) {
      try {
        await submitAttempt(attemptId);
        navigate(`/results/${attemptId}`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // useEffect(() => {
  //   const onKeyDown = (e) => {
  //     if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
  //       // не срабатывать при вводе в поля ввода/textarea
  //       const tag = document.activeElement && document.activeElement.tagName;
  //       if (tag === "INPUT" || tag === "TEXTAREA") return;
  //       e.preventDefault();
  //       handleFinish();
  //     }
  //   };

  //   window.addEventListener("keydown", onKeyDown);
  //   return () => window.removeEventListener("keydown", onKeyDown);
  // }, [handleFinish]);

  // Отправка запроса к LLM (реальная интеграция)
  const handleLlmQuery = async (e) => {
    e.preventDefault();

    if (!llmQuery.trim()) return;

    // Проверяем, что диалог создан для текущего вопроса
    if (!currentThreadId) {
      alert("Диалог с AI ещё не создан. Пожалуйста, подождите.");
      return;
    }

    // Добавляем сообщение пользователя в чат
    const userMessage = llmQuery;
    setLlmMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setLlmQuery("");
    setIsLlmLoading(true);

    try {
      // Отправляем сообщение в LLM и получаем ответ
      const questionPosition = currentQuestionIndex + 1;
      const response = await sendAIMessage(
        attemptId,
        questionPosition,
        currentThreadId, // Используем threadId для текущего вопроса
        userMessage
      );

      // Добавляем ответ модели в чат
      setLlmMessages((prev) => [
        ...prev,
        { type: "model", text: response.response },
      ]);
    } catch (err) {
      console.error("Ошибка отправки сообщения в LLM:", err);
      // Добавляем сообщение об ошибке в чат
      setLlmMessages((prev) => [
        ...prev,
        { type: "model", text: `Ошибка: ${err.message}` },
      ]);
    } finally {
      setIsLlmLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка вопросов...</div>;
  }

  if (error) {
    return <div className="loading">Ошибка: {error}</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={styles.container}>
        {/* Левая панель */}
        <div style={styles.leftPanel}>
          {/* Логотип */}
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Logo />
          </div>

          {/* Контейнер с номерами вопросов и кнопкой завершения */}
          <div style={styles.questionsContainer}>
            {/* Номера вопросов */}
            <div style={styles.questionNumbers}>
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  style={{
                    ...styles.questionNumber,
                    ...(index === currentQuestionIndex
                      ? styles.activeQuestion
                      : {}),
                  }}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Кнопка завершения тестирования */}
            <button
              onClick={handleFinish}
              style={styles.finishButton}
              title="Завершить тестирование"
            >
              Завершить
            </button>
          </div>

          <div style={styles.gorizontalSeparator} />

          {/* Контейнер для чата (прокручиваемая часть) */}
          <div style={styles.answerSection}>
            <div style={styles.messagesContainer}>
              <div style={styles.currentQuestion}>
                <p>{currentQuestion.text}</p>
              </div>

              {submittedAnswers[currentQuestion.id] && (
                <div style={styles.answer}>
                  <p style={{ margin: 0 }}>
                    {submittedAnswers[currentQuestion.id]}
                  </p>
                </div>
              )}
            </div>

            {/* Форма закреплена внизу */}
            <form onSubmit={handleSubmitAnswer} style={styles.answerForm}>
              <input
                type="text"
                placeholder="Пиши свой ответ сюда..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={styles.answerInput}
              />
              <button type="submit" style={styles.sendButton}>
                <img src="/send_2.png" style={styles.sendIcon} />
              </button>
            </form>
          </div>
        </div>

        <div style={styles.verticalSeparator} />

        {/* Правая панель - чат с LLM */}
        <div style={styles.rightPanel}>
          {/* Профиль пользователя */}
          <div style={{ padding: "20px", textAlign: "right" }}>
            <UserProfile user={user} />
          </div>

          <div style={styles.llmSection}>
            {/* Статус диалога с LLM */}
            {llmError && (
              <div style={styles.errorBanner}>
                Ошибка создания диалога: {llmError}
              </div>
            )}

            {/* Индикатор создания диалога */}
            {!currentThreadId && !llmError && (
              <div style={styles.infoBanner}>
                Создание диалога для вопроса {currentQuestionIndex + 1}...
              </div>
            )}

            {/* Чат с моделью */}
            <div style={styles.llmChat} className="llm-chat">
              {llmMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.llmMessage,
                    alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                    border: msg.type === "user" ? "1px solid white" : "",
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {/* Индикатор загрузки */}
              {isLlmLoading && (
                <div
                  style={{
                    ...styles.llmMessage,
                    alignSelf: "flex-start",
                  }}
                >
                  Модель думает...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Форма запроса к модели */}
            <form onSubmit={handleLlmQuery} style={styles.llmForm}>
              <input
                type="text"
                placeholder={
                  currentThreadId
                    ? "Спросите что-нибудь..."
                    : "Создание диалога..."
                }
                value={llmQuery}
                onChange={(e) => setLlmQuery(e.target.value)}
                style={styles.llmInput}
                disabled={!currentThreadId || isLlmLoading}
              />
              <button type="submit" style={styles.sendButton}>
                <img src="/send_2.png" style={styles.sendIcon} />
              </button>
              {/* 
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={styles.modelSelectorButton}
                  onClick={() => setShowModelList((s) => !s)}
                  aria-haspopup="listbox"
                  aria-expanded={showModelList}
                >
                  {llmModel}
                </button> */}

              {/* {showModelList && (
                  <div style={styles.modelList} role="listbox">
                    {["Gemini", "ChatGPT", "Sonnet 4.5"].map((m) => (
                      <div
                        key={m}
                        style={styles.modelListItem}
                        role="option"
                        onClick={() => {
                          setLlmModel(m);
                          setShowModelList(false);
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )} */}
              {/* </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  leftPanel: {
    width: "70%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100vh",
    overflow: "hidden",
  },
  rightPanel: {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "90vh",
    // overflowY: "hidden",
  },
  gorizontalSeparator: {
    height: "1px",
    backgroundColor: "white",
    width: "100%",
    margin: "10px 0px",
    alignSelf: "stretch",
    opacity: 1,
  },
  verticalSeparator: {
    width: "1px",
    backgroundColor: "white",
    height: "100vh",
    alignSelf: "stretch",
  },
  questionNumbers: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    width: "100%",
    padding: "8px 12px",
    justifyContent: "flex-start",
  },
  questionNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "5px",
    border: "1px solid #e2e8ecff",
    backgroundColor: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },
  activeQuestion: {
    backgroundColor: "transparent",
    borderColor: "#20627aff",
  },
  answerSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px 30px",
    color: "black",
    fontSize: "16px",
    position: "relative",
    boxSizing: "border-box",
    height: "100%",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingBottom: "10px",
    boxSizing: "border-box",
    scrollbarWidth: "thin",
    scrollbarColor: "#3d4f5d #1a2332",
  },
  currentQuestion: {
    flex: "0 0 auto",
    padding: "10px",
    backgroundColor: "#D9FFFA",
    borderRadius: "5px",
    overflow: "auto",
    display: "inline-block",
    width: "300px",
    position: "relative",
    marginTop: "10px",
    marginBottom: "20px",
  },
  answer: {
    alignSelf: "flex-end",
    maxWidth: "70%",
    backgroundColor: "#111F25",
    borderRadius: "5px",
    overflowWrap: "break-word",
    color: "white",
    fontSize: "16px",
    border: "1px solid white",
    padding: "8px 10px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  answerForm: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    height: "40px",
    marginTop: "10px",
    position: "sticky",
    bottom: "0",
    margin: "10px auto 0 auto",
    padding: "10px 20px",
    width: "60%",
    maxWidth: "500px",
    boxSizing: "border-box",
    justifyContent: "center",
  },
  answerInput: {
    flex: 1,
    padding: "6px 12px",
    height: "40px",
    lineHeight: "28px",
    backgroundColor: "#10181C",
    border: "1px solid #3d4f5d",
    borderRadius: "20px",
    color: "white",
    fontSize: "11px",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  llmSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    height: "100%",
    boxSizing: "border-box",
  },
  errorBanner: {
    backgroundColor: "transparent",
    border: "1px solid #1ca3d4",
    color: "#1ca3d4",
    padding: "8px 12px",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "16px",
    marginTop: "25px",
  },
  infoBanner: {
    backgroundColor: "rgba(28, 163, 212, 0.1)",
    border: "1px solid #1ca3d4",
    color: "#1ca3d4",
    padding: "8px 12px",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "16px",
    marginTop: "25px",
  },
  llmChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    marginBottom: "60px",
    scrollbarWidth: "thin",
    scrollbarColor: "#3d4f5d #1a2332",
    marginTop: "25px",
  },
  llmMessage: {
    maxWidth: "70%",
    padding: "10px 10px",
    borderRadius: "5px",
    fontSize: "16px",
    lineHeight: "1.5",
    backgroundColor: "#111F25",
  },
  llmForm: {
    position: "fixed",
    bottom: "20px",
    left: "85%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    width: "20%",
    maxWidth: "400px",
    margin: "0",
    alignItems: "center",
    boxSizing: "border-box",
    height: "40px",
    zIndex: 10,
    boxSizing: "border-box",
  },
  llmInput: {
    flex: 1,
    padding: "6px 12px",
    height: "40px",
    lineHeight: "28px",
    backgroundColor: "#10181C",
    border: "1px solid #3d4f5d",
    borderRadius: "20px",
    color: "white",
    fontSize: "11px",
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  },
  // modelSelectorButton: {
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   width: "90px",
  //   padding: "6px 10px",
  //   height: "28px",
  //   backgroundColor: "#041827ff",
  //   border: "1px solid #3d4f5d",
  //   borderRadius: "20px",
  //   color: "white",
  //   fontSize: "9px",
  //   boxSizing: "border-box",
  //   overflow: "hidden",
  //   textAlign: "center",
  // },
  // modelList: {
  //   position: "absolute",
  //   right: 0,
  //   backgroundColor: "#0b1220",
  //   border: "1px solid #3d4f5d",
  //   borderRadius: "6px",
  //   padding: "6px 0",
  //   zIndex: 20,
  //   boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  //   minWidth: "140px",
  //   bottom: "calc(100% + 6px)",
  // },
  // modelListItem: {
  //   padding: "8px 12px",
  //   color: "white",
  //   cursor: "pointer",
  //   whiteSpace: "nowrap",
  //   fontSize: "8px",
  // },
  sendButton: {
    backgroundColor: "#10181C",
    border: "1px solid #3d4f5d",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.2s ease",
  },
  sendIcon: {
    width: "14px",
    height: "14px",
    filter: "invert(1)", // чтобы иконка была белой на тёмном фоне
  },
  questionsContainer: {
    display: "flex",
    justifyContent: "space-between", // Разносит элементы по краям
    alignItems: "flex-start", // Выравнивает по верху
    width: "100%",
    padding: "8px 12px",
    gap: "10px",
  },
  finishButton: {
    padding: "6px 16px",
    height: "32px",
    backgroundColor: "transparent",
    border: "1px solid white",
    borderRadius: "5px",
    color: "white",
    fontSize: "10px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap", // Текст в одну строку
    transition: "all 0.2s", // Плавная анимация
  },
};

export default Testing;
