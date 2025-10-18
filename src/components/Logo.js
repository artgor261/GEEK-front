import React from "react";

function Logo() {
  return (
    <div style={styles.wrapper}>
      <img
        src="/white_logo.png"
        alt="Логотип приложения"
        style={styles.image}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "120px", // можно изменить
    height: "auto", // сохраняет пропорции
    marginTop: "-20px",
  },
};

export default Logo;
