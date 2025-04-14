import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

function Apps() {
    return <h1>Hello from React 👋</h1>;
  }
  
  export default Apps;
  