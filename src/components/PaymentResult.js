import React, { useEffect, useState } from "react";
import "../styles/paymentResult.css";

const PaymentResult = ({ success, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  // Auto-hide after 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`payment-result-overlay ${success ? "success" : "failed"}`}>
      <div className="payment-result-card">
        <div className="icon-circle">
          {success ? (
            <span className="icon-check">&#10003;</span> // ✓ symbol
          ) : (
            <span className="icon-cross">&#10005;</span> // ✕ symbol
          )}
        </div>
        <h2>{message}</h2>
      </div>
    </div>
  );
};

export default PaymentResult;
