// src/context/UPIContext.js
import React, { createContext, useState, useContext } from "react";

const UpiContext = createContext();

export const UpiProvider = ({ children }) => {
  // Logged-in user VPA
  const [currentVpa, setCurrentVpa] = useState("arjun@sakhipay");

  // User balance
  const [balance, setBalance] = useState(5000);

  // Transaction history
  const [transactions, setTransactions] = useState([]);

  // Function to send money (simulated)
  const sendMoney = (amount, to) => {
    if (amount <= 0 || amount > balance) return false;

    const newTx = {
      id: Date.now(),
      from: currentVpa,
      to,
      amount,
      status: "SUCCESS",
      timestamp: new Date().toLocaleString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setBalance((prev) => prev - amount);
    return true;
  };

  return (
    <UpiContext.Provider
      value={{
        currentVpa,
        balance,
        setBalance,
        transactions,
        setTransactions,
        sendMoney,
      }}
    >
      {children}
    </UpiContext.Provider>
  );
};

// Custom hook to use UPI context
export const useUpi = () => useContext(UpiContext);
