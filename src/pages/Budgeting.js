import React, { useState, useEffect } from "react";
import service from "../appwrite/config.js";
import authService from "../appwrite/auth.js";
import "../styles/budgeting.css";

import {
  FaUtensils,
  FaBus,
  FaShoppingCart,
  FaFileInvoice,
  FaFilm,
  FaEllipsisH,
} from "react-icons/fa";
import { analyzeExpenses } from "../utils/analyzeExpenses";

const categoryIcons = {
  Food: <FaUtensils className="icon" />,
  Transport: <FaBus className="icon" />,
  Shopping: <FaShoppingCart className="icon" />,
  Bills: <FaFileInvoice className="icon" />,
  Entertainment: <FaFilm className="icon" />,
  Other: <FaEllipsisH className="icon" />,
};

const Budgeting = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await service.getExpenses();
      if (response) {
        setExpenses(response.documents);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const getUserId = async () => {
    try {
      const user = await authService.getCurrentUser();
      return user?.$id || null;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const analyzeExpensesHandler = async () => {
    const result = await analyzeExpenses();
    if (result.error) {
      setAnalysis(result.error);
    } else {
      setAnalysis(`Expense Sentiment: ${result.sentiment} \n Analysis: ${result.analysis}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) {
        alert("User not logged in.");
        return;
      }

      const formattedAmount = parseFloat(amount);
      const formattedDate = new Date(date).toISOString();

      const newExpense = await service.createExpense({
        userId,
        amount: formattedAmount,
        category,
        description,
        date: formattedDate,
      });

      if (newExpense) {
        setExpenses((prev) => [newExpense, ...prev]);
      }

      setAmount("");
      setDescription("");
      setDate("");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await service.deleteExpense(documentId);
      setExpenses(expenses.filter((expense) => expense.$id !== documentId));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="budgeting-container">
      <h2 className="budgeting">Budgeting & Expenses</h2>
      <form onSubmit={handleSubmit} className="budget-form">
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.keys(categoryIcons).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button type="submit">Add Expense</button>
      </form>

      <h3 className="transaction">Transaction History</h3>
      <div className="table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <tr key={expense.$id}>
                  <td className="icon-category">
                    {categoryIcons[expense.category]} {expense.category}
                  </td>
                  <td>{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(expense.$id)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No expenses recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="analyze-btn" onClick={analyzeExpensesHandler}>Analyze Expenses</button>
      {analysis && (
  <div className="analysis-container">
    <h3 className="analysis-title">📊 Expense Analysis</h3>
    
    <div className="analysis-content">
      {analysis.split("\n").map((line, index) => {
        const [key, value] = line.split(": "); // Split into key & value
        return (
          <div key={index} className="analysis-item">
            {value ? (
              <>
                <strong>{key}:</strong> <span>{value}</span>
              </>
            ) : (
              <span>{key}</span> // If no ":", just display the line
            )}
          </div>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
};

export default Budgeting;
