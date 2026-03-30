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
  FaTrash,
  FaEye,
  FaFolder,
  FaImage,
  FaFilePdf,
  FaFileAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { analyzeExpenses } from "../utils/analyzeExpenses";
import { uploadFileToS3, deleteFileFromS3, generatePresignedViewUrl } from "../utils/s3Service";

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

  // File Storage State
  const [storedFiles, setStoredFiles] = useState([]);
  const [fileStorageUploading, setFileStorageUploading] = useState(false);
  const [fileStorageProgress, setFileStorageProgress] = useState(0);
  const [selectedStorageFile, setSelectedStorageFile] = useState(null);
  const [fileStoragePreview, setFileStoragePreview] = useState(null);
  const [fileCategory, setFileCategory] = useState("Bills");
  const [fileDescription, setFileDescription] = useState("");

  useEffect(() => {
    fetchExpenses();
    loadStoredFiles();
  }, []);

  // Debug storedFiles changes
  useEffect(() => {
    console.log('storedFiles updated:', storedFiles);
  }, [storedFiles]);

  const loadStoredFiles = () => {
    try {
      const savedFiles = localStorage.getItem('storedFiles');
      if (savedFiles) {
        setStoredFiles(JSON.parse(savedFiles));
      }
    } catch (error) {
      console.error('Error loading stored files from localStorage:', error);
    }
  };

  const saveStoredFiles = (files) => {
    try {
      localStorage.setItem('storedFiles', JSON.stringify(files));
    } catch (error) {
      console.error('Error saving stored files to localStorage:', error);
    }
  };

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

      // Create expense first
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

      // Reset form
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

  // File Storage Functions
  const handleStorageFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedStorageFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFileStoragePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFileStoragePreview(null);
      }
    }
  };

  const uploadStorageFile = async (file, category, description) => {
    try {
      setFileStorageUploading(true);
      setFileStorageProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFileStorageProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const userId = await getUserId();
      const fileId = `storage_${Date.now()}`;
      
      const result = await uploadFileToS3(file, userId, fileId);
      
      clearInterval(progressInterval);
      setFileStorageProgress(100);
      
      if (result.success) {
        const fileData = {
          id: fileId,
          name: file.name,
          url: result.fileUrl,
          category: category,
          description: description,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          userId: userId
        };
        
        const newFiles = [fileData, ...storedFiles];
        setStoredFiles(newFiles);
        saveStoredFiles(newFiles);
        return result.fileUrl;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error uploading storage file:', error);
      throw error;
    } finally {
      setFileStorageUploading(false);
      setFileStorageProgress(0);
    }
  };

  const handleStorageFileUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedStorageFile) {
      alert("Please select a file to upload");
      return;
    }

    if (!fileDescription.trim()) {
      alert("Please provide a description for the file");
      return;
    }

    try {
      await uploadStorageFile(selectedStorageFile, fileCategory, fileDescription);
      
      // Reset form
      setSelectedStorageFile(null);
      setFileStoragePreview(null);
      setFileDescription("");
      setFileCategory("Bills");
      
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    }
  };

  const handleStorageFileDelete = async (fileId, fileUrl) => {
    try {
      const result = await deleteFileFromS3(fileUrl);
      
      if (result.success) {
        const newFiles = storedFiles.filter(file => file.id !== fileId);
        setStoredFiles(newFiles);
        saveStoredFiles(newFiles);
        alert('File deleted successfully');
      } else {
        alert('Error deleting file: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting storage file:', error);
      console.error('Error stack:', error.stack);
      alert('Error deleting file: ' + error.message);
    }
  };

  const clearStorageFileSelection = () => {
    setSelectedStorageFile(null);
    setFileStoragePreview(null);
    setFileDescription("");
    setFileCategory("Bills");
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaImage className="file-icon" />;
    if (fileType === 'application/pdf') return <FaFilePdf className="file-icon" />;
    return <FaFileAlt className="file-icon" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewFile = async (fileUrl) => {
    try {
      const result = await generatePresignedViewUrl(fileUrl);
      
      if (result.success) {
        window.open(result.presignedUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.error('Error generating presigned URL:', result.error);
        alert('Error opening file: ' + result.error);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error opening file: ' + error.message);
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
        

        <div className="form-actions">
          <button type="submit">
            Add Expense
          </button>
          <button 
            type="button" 
            onClick={() => {
              setAmount("");
              setDescription("");
              setDate("");
            }}
            className="clear-form-btn"
          >
            Clear Form
          </button>
        </div>
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

      {/* File Storage Section */}
      <div className="file-storage-section">
        <h3 className="file-storage-title">
          <FaFolder className="section-icon" />
          File Storage - Bills & Receipts
        </h3>
        
        {/* File Upload Form */}
        <form onSubmit={handleStorageFileUpload} className="file-storage-form">
          <div className="file-upload-section">
            <label htmlFor="storage-file-input" className="file-upload-label">
              <FaCloudUploadAlt className="upload-icon" />
              Choose File to Store
            </label>
            <input
              id="storage-file-input"
              type="file"
              onChange={handleStorageFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />
            
            {selectedStorageFile && (
              <div className="selected-file">
                <div className="file-info">
                  <span className="file-name">{selectedStorageFile.name}</span>
                  <span className="file-size">({formatFileSize(selectedStorageFile.size)})</span>
                </div>
                <button 
                  type="button" 
                  onClick={clearStorageFileSelection}
                  className="remove-file-btn"
                >
                  <FaTrash />
                </button>
              </div>
            )}

            {/* Image Preview */}
            {fileStoragePreview && (
              <div className="image-preview">
                <img 
                  src={fileStoragePreview} 
                  alt="Preview" 
                  className="preview-image"
                  onClick={() => window.open(fileStoragePreview, '_blank', 'noopener,noreferrer')}
                />
                <div className="preview-overlay">
                  <FaEye className="preview-icon" />
                  <span>Click to view full size</span>
                </div>
              </div>
            )}
          </div>

          <div className="file-details">
            <select 
              value={fileCategory} 
              onChange={(e) => setFileCategory(e.target.value)}
              className="file-category-select"
            >
              <option value="Bills">Bills</option>
              <option value="Receipts">Receipts</option>
              <option value="Invoices">Invoices</option>
              <option value="Documents">Documents</option>
              <option value="Other">Other</option>
            </select>
            
            <input
              type="text"
              placeholder="File description (required)"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              className="file-description-input"
              required
            />
          </div>

          {/* Upload Progress */}
          {fileStorageUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${fileStorageProgress}%` }}
                ></div>
              </div>
              <span>Uploading... {fileStorageProgress}%</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={fileStorageUploading || !selectedStorageFile}>
              {fileStorageUploading ? "Uploading..." : "Upload File"}
            </button>
            <button 
              type="button" 
              onClick={clearStorageFileSelection}
              className="clear-form-btn"
              disabled={fileStorageUploading}
            >
              Clear Selection
            </button>
          </div>
        </form>

        {/* Stored Files List */}
        <div className="stored-files-section">
          <h4 className="stored-files-title">Your Stored Files ({storedFiles.length})</h4>
          {console.log('Rendering stored files section, count:', storedFiles.length)}
          
          {storedFiles.length > 0 ? (
            <div className="stored-files-grid">
              {storedFiles.map((file) => (
                <div key={file.id} className="stored-file-card">
                  <div className="file-header">
                    <div className="file-icon-container">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-actions">
                      <button 
                        className="view-file-btn"
                        onClick={() => handleViewFile(file.url)}
                        title="View file"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="delete-file-btn"
                        onClick={() => handleStorageFileDelete(file.id, file.url)}
                        title="Delete file"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="file-content">
                    <h5 className="file-name" title={file.name}>
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </h5>
                    <p className="file-description">{file.description}</p>
                    <div className="file-meta">
                      <span className="file-category">{file.category}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="file-date">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-files-message">
              <FaFolder className="empty-folder-icon" />
              <p>No files stored yet. Upload your bills and receipts to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgeting;
