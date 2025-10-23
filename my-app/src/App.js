import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StartTest from "./pages/StartTest";
import Testing from "./pages/Testing";
import Results from "./pages/Results";
import { checkSession } from "./api";
import "./App.css";

function App() {
  // Состояние пользователя (null - не загружено, false - не авторизован, объект - авторизован)
  const [user, setUser] = useState(null);

  // При загрузке приложения проверяем, авторизован ли пользователь
  useEffect(() => {
    checkSession()
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(false);
        }
      })
      .catch(() => setUser(false));
  }, []);

  // Пока проверяется сессия, показываем загрузку
  if (user === null) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Страница регистрации */}
        <Route
          path="/register"
          element={
            user ? <Navigate to="/login" /> : <Register setUser={setUser} />
          }
        />

        {/* Страница входа */}
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* Страница старта тестирования */}
        <Route
          path="/start"
          element={user ? <StartTest user={user} /> : <Navigate to="/login" />}
        />

        {/* Страница тестирования */}
        <Route
          path="/testing/:attemptId"
          element={user ? <Testing user={user} /> : <Navigate to="/login" />}
        />

        {/* Страница результатов */}
        <Route
          path="/results/:attemptId"
          element={user ? <Results user={user} /> : <Navigate to="/login" />}
        />

        {/* По умолчанию перенаправляем на страницу входа */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
