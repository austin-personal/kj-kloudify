import React from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  return (
    <div className="toast">
      <div className="toast-message">{message}</div>
      <button onClick={onClose} className="toast-close">
        &times;
      </button>
    </div>
  );
};

export default Toast;
