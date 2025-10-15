import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUpi } from "../context/UPIContext";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/upiSimulation.css";
import { BrowserMultiFormatReader } from "@zxing/library";
import PaymentResult from "../components/PaymentResult";

const socket = io("http://localhost:4000");

// --- SUCCESS / FAILURE sounds ---
const successSound = new Audio("/success.mp3");

//////////////////////////////////////////
// VendorSimulation
const VendorSimulation = () => {
  const { currentVpa, balance, setBalance, transactions, setTransactions } = useUpi();
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [status, setStatus] = useState("");

  const generateQr = () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");
    const id = Date.now();
    setTxnId(id);
    setShowQr(true);
    setStatus("WAITING_PAYMENT");
  };

  const simulatePayment = (success) => {
    setStatus(success ? "SUCCESS" : "FAILED");
    if (success) {
      setBalance((prev) => prev + Number(amount));
      successSound.play();
    }
  };

  return (
    <div className="upi-sim-container">
      <h3>Vendor Side Simulation</h3>
      <div className="info-section">
        <div className="info-box">
          <h3>Vendor VPA</h3>
          <p>{currentVpa}</p>
        </div>
        <div className="info-box">
          <h3>Balance</h3>
          <p>₹{balance}</p>
        </div>
      </div>

      <div className="form-group">
        <label>Amount to receive (₹):</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button onClick={generateQr}>Generate QR</button>

      {showQr && txnId && (
        <div className="txn-card">
          <h4>Transaction QR</h4>

          {/* Vendor Info Card */}
          <div className="vendor-info-card">
            <p><b>Vendor VPA:</b> {currentVpa}</p>
            <p><b>Amount Requested:</b> ₹{amount}</p>
          </div>

          <QRCodeCanvas size={180} value={`upi://pay?pa=${currentVpa}&am=${amount}`} />

          {(status === "SUCCESS" || status === "FAILED") && (
            <PaymentResult
              success={status === "SUCCESS"}
              message={status === "SUCCESS" ? "Payment Successful!" : "Payment Failed!"}
              onClose={() => setStatus("")}
            />
          )}

          {status === "WAITING_PAYMENT" && (
            <div className="txn-buttons">
              <button onClick={() => simulatePayment(true)}>Simulate SUCCESS</button>
              <button onClick={() => simulatePayment(false)}>Simulate FAILURE</button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

//////////////////////////////////////////
// CustomerSimulation
const CustomerSimulation = () => {
  const { currentVpa, balance, setBalance, transactions, setTransactions } = useUpi();

  const videoRef = useRef(null);
  const [scanMode, setScanMode] = useState(false);
  const [mode, setMode] = useState("scan"); // scan or manual
  const [toVpa, setToVpa] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [error, setError] = useState(null);

  // QR Scanner
  useEffect(() => {
    if (!scanMode || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          try {
            const data = result.getText();
            const url = new URL(data);
            if (url.protocol === "upi:") {
              setToVpa(url.searchParams.get("pa"));
              setAmount(url.searchParams.get("am"));
              setScanMode(false);
              setTxnId(Date.now());
              setStatus("PENDING");
            } else {
              alert("Invalid QR code");
            }
          } catch (e) {
            alert("Invalid QR code format");
          }
        }
        if (err && !(err.name === "NotFoundException")) setError(err.message);
      }
    );

    return () => codeReader.reset();
  }, [scanMode]);

  const manualPay = () => {
    if (!toVpa || !amount) return alert("Enter VPA and amount");
    setTxnId(Date.now());
    setStatus("PENDING");
  };

  const proceedPayment = () => {
    if (!pin) return alert("Enter PIN (try 1234)");

    const success = pin === "1234" && Number(amount) <= balance;
    setStatus(success ? "SUCCESS" : "FAILED");

    if (success) {
      setBalance((prev) => prev - Number(amount));
      successSound.play();
    }

    setTransactions((prev) => [
      {
        id: txnId,
        from: currentVpa,
        to: toVpa,
        amount,
        status: success ? "SUCCESS" : "FAILED",
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    // Reset fields
    setTxnId(null);
    setToVpa("");
    setAmount("");
    setPin("");
  };

  return (
    <div className="upi-sim-container">
      <h3>Customer Side Simulation</h3>
      {/* Highlighted User Info Card */}
        {/* User Info Bar */}
    <div className="info-section">
  <div className="info-box">
    <h3>User VPA</h3>
    <p>{currentVpa}</p>
  </div>
  <div className="info-box">
    <h3>Balance</h3>
    <p>₹{balance}</p>
  </div>
</div>




      {/* Scan / Manual Mode */}
      <div className="simulation-mode-selector">
        <label>
          <input
            type="radio"
            checked={mode === "scan"}
            onChange={() => setMode("scan")}
          />
          <span>Scan QR</span>
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          <span>Manual Pay</span>
        </label>
      </div>

      {/* Scan Mode */}
      {mode === "scan" && !scanMode && (
        <button onClick={() => setScanMode(true)}>Open Camera & Scan QR</button>
      )}

      {scanMode && (
        <div>
          <video ref={videoRef} style={{ width: "100%" }} />
          {error && <p style={{ color: "red" }}>Camera Error: {error}</p>}
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <>
          <div className="form-group">
            <label>Pay to VPA:</label>
            <input value={toVpa} onChange={(e) => setToVpa(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Amount (₹):</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <button onClick={manualPay}>Proceed Payment</button>
        </>
      )}

      {/* PIN Entry */}
      {(status === "PENDING" || status === "PROCESSING") && (
        <div className="txn-card">
          <p>Paying ₹{amount} to {toVpa}</p>
          <div className="form-group">
            <label>Enter UPI PIN (try 1234):</label>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
          <button onClick={proceedPayment}>Confirm Payment</button>
        </div>
      )}

      {/* Result */}
      {status === "SUCCESS" && <PaymentResult success={true} message="Payment Successful!" />}
      {status === "FAILED" && <PaymentResult success={false} message="Payment Failed!" />}
    </div>
  );
};

//////////////////////////////////////////
// Main Component
const UpiSimulation = () => {
  const [mode, setMode] = useState("vendor");

  return (
    <div className="upi-sim-wrapper">
      <h2>Sakhi Pay UPI Simulation</h2>
      <hr className="section-divider" />

      {/* Vendor / Customer Tabs */}
      <div className="simulation-mode-selector">
        <label>
          <input
            type="radio"
            value="vendor"
            checked={mode === "vendor"}
            onChange={() => setMode("vendor")}
          />
          <span>Vendor Side Simulation</span>
        </label>
        <label>
          <input
            type="radio"
            value="customer"
            checked={mode === "customer"}
            onChange={() => setMode("customer")}
          />
          <span>Customer Side Simulation</span>
        </label>
      </div>
      <hr className="section-divider" />

      {mode === "vendor" && <VendorSimulation />}
      {mode === "customer" && <CustomerSimulation />}
    </div>
  );
};

export default UpiSimulation;
