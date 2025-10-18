import React from "react";

// Компонент профиля пользователя
function UserProfile({ user }) {
  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <div style={styles.name}>{user.email}</div>
        <div style={styles.subtitle}>Продвинутый тест</div>
      </div>
      {/* Иконка пользователя */}
      <div style={styles.icon}>
        <svg width="25" height="25" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="2" />
          <circle cx="20" cy="15" r="6" stroke="white" strokeWidth="2" />
          <path
            d="M8 32C8 32 10 25 20 25C30 25 32 32 32 32"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    right: 5,
    display: "flex",
    gap: "15px",
  },
  info: {
    textAlign: "right",
  },
  name: {
    fontSize: "12px",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: "8px",
    color: "#9ca3af",
  },
  icon: {
    width: "25px",
  },
};

export default UserProfile;
