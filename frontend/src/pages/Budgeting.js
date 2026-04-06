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
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedReceipts, setUploadedReceipts] = useState([]);

  useEffect(() => {
    fetchExpenses();
    // Load uploaded receipts from localStorage
    const savedReceipts = localStorage.getItem('uploadedReceipts');
    if (savedReceipts) {
      setUploadedReceipts(JSON.parse(savedReceipts));
    }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setReceiptFile(file);
    } else {
      alert('Please select an image file');
    }
  };

  const uploadReceipt = async () => {
    if (!receiptFile) return;
    
    setUploading(true);
    try {
      // Get presigned URL
      const response = await fetch(`http://localhost:4000/api/s3/presign?filename=${encodeURIComponent(receiptFile.name)}&contentType=${receiptFile.type}`);
      const { url, key, publicUrl } = await response.json();
      
      // Upload file to S3
      await fetch(url, {
        method: 'PUT',
        body: receiptFile,
        headers: {
          'Content-Type': receiptFile.type,
        },
      });
      
      // Add to uploaded receipts list
      const newReceipt = {
        id: Date.now(),
        name: receiptFile.name,
        url: publicUrl,
        uploadedAt: new Date().toLocaleString(),
      };
      
      const updatedReceipts = [newReceipt, ...uploadedReceipts];
      setUploadedReceipts(updatedReceipts);
      localStorage.setItem('uploadedReceipts', JSON.stringify(updatedReceipts));
      setReceiptFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('receipt-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const deleteReceipt = (receiptId) => {
    const updatedReceipts = uploadedReceipts.filter(receipt => receipt.id !== receiptId);
    setUploadedReceipts(updatedReceipts);
    localStorage.setItem('uploadedReceipts', JSON.stringify(updatedReceipts));
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

      {/* Receipt Upload Section */}
      <div className="receipt-upload-section">
        <h3>📄 Upload Receipt/Bill</h3>
        <div className="upload-controls">
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          {receiptFile && (
            <div className="file-preview">
              <p>Selected: {receiptFile.name}</p>
              <button 
                onClick={uploadReceipt} 
                disabled={uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : 'Upload Receipt'}
              </button>
            </div>
          )}
        </div>
        
        {/* Uploaded Receipts List */}
        {uploadedReceipts.length > 0 && (
          <div className="uploaded-receipts">
            <h4>📋 Uploaded Receipts</h4>
            {uploadedReceipts.map((receipt) => (
              <div key={receipt.id} className="receipt-item">
                <div className="receipt-info">
                  <p><strong>{receipt.name}</strong></p>
                  <p className="upload-time">{receipt.uploadedAt}</p>
                  <div className="receipt-actions">
                    <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="view-link">
                      View Receipt
                    </a>
                    <button 
                      onClick={() => deleteReceipt(receipt.id)}
                      className="delete-receipt-btn"
                      title="Delete Receipt"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <img src={receipt.url} alt={receipt.name} className="receipt-thumbnail" />
              </div>
            ))}
          </div>
        )}
      </div>

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
