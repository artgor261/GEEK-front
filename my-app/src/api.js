// Базовый URL API
// const API_BASE = "http://localhost:8080/api";

// Настройки для всех запросов (отправка cookies)
const fetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Регистрация нового пользователя
 * @param {string} email - Электронная почта
 * @param {string} password - Пароль
 * @param {string} confirmPassword - Подтверждение пароля
 * @returns {Promise} - Данные пользователя
 */
export async function register(email, password, confirmPassword) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/register`,
    {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        confirm_password: confirmPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка регистрации");
  }

  return data;
}

/**
 * Вход пользователя в систему
 * @param {string} email - Электронная почта
 * @param {string} password - Пароль
 * @returns {Promise} - Данные пользователя
 */
export async function login(email, password) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка входа");
  }

  return data;
}

/**
 * Выход из системы
 */
export async function logout() {
  await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
    ...fetchOptions,
    method: "POST",
  });
}

/**
 * Проверка текущей сессии
 * @returns {Promise} - Статус авторизации и данные пользователя
 */
export async function checkSession() {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/session`, {
    ...fetchOptions,
    method: "GET",
  });

  return response.json();
}

/**
 * Получение теста по ID
 * @param {number} testId - ID теста
 * @returns {Promise} - Данные теста
 */
export async function getTestById(testId) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/test/${testId}`,
    {
      ...fetchOptions,
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка загрузки теста");
  }

  return data;
}

/**
 * Старт тестирования (создание попытки)
 * ИЗМЕНЕНО: /tests/{test_id}/attempt вместо /tests/{test_id}/attempts
 * @param {number} testId - ID теста
 * @returns {Promise} - Данные попытки тестирования
 */
export async function startAttempt(testId) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/tests/${testId}/attempt`,
    {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ access_code: "TEST-2025-INFINITY" }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка старта тестирования");
  }

  return data;
}

/**
 * Получение вопросов для попытки тестирования
 * ИЗМЕНЕНО: /attempt/{attempt_id}/question вместо /attempts/{attempt_id}/questions
 * @param {number} attemptId - ID попытки
 * @returns {Promise} - Список вопросов
 */
export async function getAttemptQuestions(attemptId) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/question`,
    {
      ...fetchOptions,
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка загрузки вопросов");
  }

  return data;
}

/**
 * Отправка ответа на вопрос
 * ИЗМЕНЕНО: /attempt/{attempt_id}/question/{question_position}/submit
 * вместо /attempts/{attempt_id}/answers/{question_id}
 * @param {number} attemptId - ID попытки
 * @param {number} questionPosition - Позиция вопроса (номер вопроса в списке)
 * @param {string} text - Текст ответа
 * @returns {Promise} - Данные ответа
 */
export async function postAnswer(attemptId, questionPosition, text) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/question/${questionPosition}/submit`,
    {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ text }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка отправки ответа");
  }

  return data;
}

/**
 * Завершение тестирования
 * ИЗМЕНЕНО: /attempt/{attempt_id}/submit вместо /attempts/{attempt_id}/submit
 * @param {number} attemptId - ID попытки
 * @returns {Promise} - Результаты тестирования
 */
export async function submitAttempt(attemptId) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/submit`,
    {
      ...fetchOptions,
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка завершения тестирования");
  }

  return data;
}

/* Создание нового диалога с LLM для конкретного вопроса
 * Создаёт thread в OpenAI и сохраняет его в хранилище
 * @param {number} attemptId - ID попытки тестирования
 * @param {number} questionPosition - Позиция вопроса
 * @returns {Promise} - Данные созданного диалога { thread_id, attempt_id, status }
 */
export async function createAIDialogue(attemptId, questionPosition) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/question/${questionPosition}/ai/start`,
    {
      ...fetchOptions,
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка создания диалога с AI");
  }

  return data;
}

/**
 * Отправка сообщения в существующий диалог с LLM
 * Отправляет сообщение пользователя, запускает ассистента и возвращает ответ
 * @param {number} attemptId - ID попытки тестирования
 * @param {number} questionPosition - Позиция вопроса
 * @param {string} threadId - ID диалога (thread)
 * @param {string} message - Текст сообщения для LLM
 * @returns {Promise} - Ответ от AI модели { response: string }
 */
export async function sendAIMessage(
  attemptId,
  questionPosition,
  threadId,
  message
) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/question/${questionPosition}/ai/${threadId}/send`,
    {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка отправки сообщения в AI");
  }

  return data;
}

/**
 * Получение результатов тестирования
 * Возвращает итоговый балл и список всех ответов пользователя с проверкой
 * @param {number} attemptId - ID попытки тестирования
 * @returns {Promise} - Результаты тестирования
 * @returns {Promise<{score: number, answers: Array}>} - Объект с полями:
 *   - score: количество набранных баллов (uint64)
 *   - answers: массив ответов, каждый с полями:
 *     - id: ID ответа
 *     - question_id: ID вопроса
 *     - text: текст ответа пользователя
 *     - right_or_no: правильный ли ответ (boolean)
 *     - created_at: время создания ответа
 */
export async function getAttemptResults(attemptId) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/attempt/${attemptId}/result`,
    {
      ...fetchOptions,
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка загрузки результатов");
  }

  return data;
}
