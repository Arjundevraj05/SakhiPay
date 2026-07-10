import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUpi } from "../context/UPIContext";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/upiSimulation.css";
import { BrowserMultiFormatReader } from "@zxing/library";
import PaymentResult from "../components/PaymentResult";

const successSound = new Audio("/success.mp3");

function parseUpiQr(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    if (url.protocol === "upi:") {
      const pa = url.searchParams.get("pa");
      const am = url.searchParams.get("am");
      const tr = url.searchParams.get("tr");
      if (pa && am) {
        return { pa, am, tr };
      }
    }
  } catch {
    // fall through to regex parsing
  }

  const pa = text.match(/[?&]pa=([^&]+)/i)?.[1];
  const am = text.match(/[?&]am=([^&]+)/i)?.[1];
  const tr = text.match(/[?&]tr=([^&]+)/i)?.[1];
  if (pa && am) {
    return {
      pa: decodeURIComponent(pa),
      am: decodeURIComponent(am),
      tr: tr ? decodeURIComponent(tr) : null,
    };
  }

  return null;
}

function stopVideoStream(videoEl) {
  const stream = videoEl?.srcObject;
  if (stream && typeof stream.getTracks === "function") {
    stream.getTracks().forEach((track) => track.stop());
  }
  if (videoEl) {
    videoEl.srcObject = null;
  }
}

function buildQrValue(vendorVpa, amount, requestId) {
  const params = new URLSearchParams({
    pa: vendorVpa,
    am: String(amount),
  });
  if (requestId) {
    params.set("tr", requestId);
  }
  return `upi://pay?${params.toString()}`;
}

const VendorSimulation = () => {
  const {
    vendorVpa,
    vendorBalance,
    activePaymentRequest,
    apiReady,
    createPaymentRequest,
    pollPaymentRequest,
    notifyEmail,
    clearActivePaymentRequest,
    refreshBalances,
  } = useUpi();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const notifiedRef = useRef(null);

  useEffect(() => {
    if (!activePaymentRequest?.requestId) return undefined;

    if (["WAITING", "PENDING", "PROCESSING"].includes(activePaymentRequest.status)) {
      setStatus("WAITING_PAYMENT");
      return undefined;
    }

    const notifyKey = `${activePaymentRequest.requestId}:${activePaymentRequest.status}`;
    if (notifiedRef.current === notifyKey) {
      return undefined;
    }

    if (activePaymentRequest.status === "SUCCESS") {
      notifiedRef.current = notifyKey;
      setStatus("SUCCESS");
      successSound.play().catch(() => {});
      notifyEmail({
        role: "vendor",
        status: "SUCCESS",
        amount: activePaymentRequest.amount,
        fromVpa: activePaymentRequest.fromVpa || "customer",
        toVpa: vendorVpa,
        txnId: activePaymentRequest.txnId,
      });
      return undefined;
    }

    if (activePaymentRequest.status === "FAILED") {
      notifiedRef.current = notifyKey;
      setStatus("FAILED");
      notifyEmail({
        role: "vendor",
        status: "FAILED",
        amount: activePaymentRequest.amount,
        fromVpa: activePaymentRequest.fromVpa || "customer",
        toVpa: vendorVpa,
        txnId: activePaymentRequest.txnId,
      });
    }
  }, [activePaymentRequest, notifyEmail, vendorVpa]);

  const generateQr = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setError(null);
    setLoading(true);
    setStatus("");

    try {
      const request = await createPaymentRequest(numAmount);
      setStatus("WAITING_PAYMENT");

      pollPaymentRequest(request.requestId).catch(() => {
        // Timeout is handled silently; vendor can generate a new QR
      });
    } catch (requestError) {
      setError(requestError.message || "Could not create payment request");
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    notifiedRef.current = null;
    clearActivePaymentRequest();
    setAmount("");
    setStatus("");
    setError(null);
    refreshBalances();
  };

  const qrRequest = activePaymentRequest;
  const showQr =
    qrRequest &&
    qrRequest.amount &&
    ["WAITING", "PENDING", "PROCESSING", "SUCCESS", "FAILED"].includes(
      qrRequest.status
    );

  return (
    <div className="upi-sim-container">
      <h3>Vendor Side Simulation</h3>
      <p className="sim-role-hint">Merchant receives payments at this VPA</p>

      <div className="info-section">
        <div className="info-box">
          <h3>Vendor VPA</h3>
          <p>{vendorVpa}</p>
        </div>
        <div className="info-box">
          <h3>Balance</h3>
          <p>₹{vendorBalance}</p>
        </div>
      </div>

      {!showQr && (
        <>
          <div className="form-group">
            <label>Amount to receive (₹):</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!apiReady || loading}
            />
          </div>
          <button type="button" onClick={generateQr} disabled={!apiReady || loading}>
            {loading ? "Generating…" : "Generate QR"}
          </button>
        </>
      )}

      {error && <p className="qr-scan-error">{error}</p>}

      {showQr && (
        <div className="txn-card">
          <h4>Transaction QR</h4>
          <div className="vendor-info-card">
            <p>
              <b>Vendor VPA:</b> {vendorVpa}
            </p>
            <p>
              <b>Amount Requested:</b> ₹{qrRequest.amount}
            </p>
            <p>
              <b>Request ID:</b> {qrRequest.requestId.slice(0, 8)}…
            </p>
          </div>

          <QRCodeCanvas
            size={180}
            value={buildQrValue(vendorVpa, qrRequest.amount, qrRequest.requestId)}
          />

          {status === "WAITING_PAYMENT" && (
            <p className="payment-waiting">
              Waiting for customer to scan and pay…
            </p>
          )}

          {(status === "SUCCESS" || status === "FAILED") && (
            <PaymentResult
              success={status === "SUCCESS"}
              message={
                status === "SUCCESS"
                  ? `Received ₹${qrRequest.amount} successfully!`
                  : "Customer payment failed"
              }
              onClose={resetPayment}
            />
          )}

          {status === "WAITING_PAYMENT" && (
            <button type="button" className="qr-close-btn" onClick={resetPayment}>
              Cancel Request
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CustomerSimulation = () => {
  const {
    customerVpa,
    customerBalance,
    vendorVpa,
    apiReady,
    completePayment,
    notifyEmail,
    refreshBalances,
  } = useUpi();

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [scanMode, setScanMode] = useState(false);
  const [mode, setMode] = useState("scan");
  const [toVpa, setToVpa] = useState("");
  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [scanHint, setScanHint] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const resetPaymentForm = useCallback(() => {
    setToVpa("");
    setAmount("");
    setRequestId(null);
    setPin("");
    setStatus("");
    setFailureReason("");
    setError(null);
    refreshBalances();
  }, [refreshBalances]);

  const closeScanner = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    stopVideoStream(videoRef.current);
    setScanMode(false);
    setScanHint("");
  }, []);

  const openScanner = () => {
    setError(null);
    setFailureReason("");
    setScanHint("Requesting camera access…");
    setScanMode(true);
  };

  const applyScannedPayment = useCallback(
    (parsed) => {
      if (!parsed?.pa || !parsed?.am) {
        setError("Invalid UPI QR code. Generate a QR from Vendor side and scan it.");
        return false;
      }

      const payAmount = Number(parsed.am);
      if (!Number.isFinite(payAmount) || payAmount <= 0) {
        setError("QR code has an invalid amount.");
        return false;
      }

      if (parsed.pa !== vendorVpa) {
        setError(`This QR is not for the demo vendor (${vendorVpa}).`);
        return false;
      }

      setToVpa(parsed.pa);
      setAmount(String(payAmount));
      setRequestId(parsed.tr || null);
      setStatus("PENDING");
      setError(null);
      setFailureReason("");
      return true;
    },
    [vendorVpa]
  );

  useEffect(() => {
    if (!scanMode) return undefined;

    let active = true;
    const videoEl = videoRef.current;
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanner = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 50));

      if (!active || !videoEl) {
        setError("Could not start camera preview. Please try again.");
        setScanMode(false);
        return;
      }

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera is not supported in this browser.");
        }

        let preferredDevice = null;
        try {
          const devices = await codeReader.listVideoInputDevices();
          preferredDevice =
            devices.find((device) => /back|rear|environment/i.test(device.label))?.deviceId ||
            devices.find((device) =>
              /front|user|facetime|integrated|webcam|hd camera|camera/i.test(device.label)
            )?.deviceId ||
            devices[0]?.deviceId ||
            null;
        } catch {
          preferredDevice = null;
        }

        setScanHint("Point your camera at the vendor UPI QR code");

        await codeReader.decodeFromVideoDevice(
          preferredDevice,
          videoEl,
          (result, err) => {
            if (!active) return;

            if (result) {
              const parsed = parseUpiQr(result.getText());
              if (applyScannedPayment(parsed)) {
                setScanHint("QR scanned successfully!");
                closeScanner();
              }
            }

            if (
              err &&
              err.name !== "NotFoundException" &&
              err.name !== "ChecksumException" &&
              err.name !== "FormatException"
            ) {
              setError(err.message || "Camera scanning error.");
            }
          }
        );
      } catch (cameraError) {
        setError(
          cameraError.message ||
            "Camera permission denied. Allow camera access in your browser and try again."
        );
        setScanMode(false);
      }
    };

    startScanner();

    return () => {
      active = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      stopVideoStream(videoEl);
    };
  }, [scanMode, closeScanner, applyScannedPayment]);

  const manualPay = () => {
    const payAmount = Number(amount);
    if (!toVpa || !payAmount) {
      setError("Enter VPA and amount");
      return;
    }
    if (toVpa !== vendorVpa) {
      setError(`Manual demo payments must go to ${vendorVpa}`);
      return;
    }
    if (payAmount > customerBalance) {
      setError("Insufficient balance for this payment.");
      return;
    }
    setRequestId(null);
    setStatus("PENDING");
    setError(null);
    setFailureReason("");
  };

  const proceedPayment = async () => {
    if (!pin) {
      setError("Enter UPI PIN (demo PIN: 1234)");
      return;
    }

    const payAmount = Number(amount);
    if (!toVpa || !payAmount) {
      setError("Payment details are missing");
      return;
    }
    if (payAmount > customerBalance) {
      setError("Insufficient balance for this payment.");
      return;
    }

    setError(null);
    setFailureReason("");
    setStatus("PROCESSING");

    try {
      const txn = await completePayment({
        toVpa,
        amount: payAmount,
        requestId,
        pin,
      });

      const succeeded = txn.status === "SUCCESS";
      setStatus(succeeded ? "SUCCESS" : "FAILED");
      setFailureReason(txn.failureReason || "");

      if (succeeded) {
        successSound.play().catch(() => {});
      }

      await notifyEmail({
        role: "customer",
        status: txn.status,
        amount: payAmount,
        fromVpa: customerVpa,
        toVpa,
        txnId: txn.txnId,
      });
    } catch (paymentError) {
      setStatus("FAILED");
      setFailureReason(paymentError.message || "Payment could not be completed");
      setError(paymentError.message || "Payment could not be completed");
    }
  };

  return (
    <div className="upi-sim-container">
      <h3>Customer Side Simulation</h3>
      <p className="sim-role-hint">Customer pays from this VPA</p>

      <div className="info-section">
        <div className="info-box">
          <h3>User VPA</h3>
          <p>{customerVpa}</p>
        </div>
        <div className="info-box">
          <h3>Balance</h3>
          <p>₹{customerBalance}</p>
        </div>
      </div>

      <div className="simulation-mode-selector">
        <label>
          <input
            type="radio"
            checked={mode === "scan"}
            onChange={() => {
              setMode("scan");
              setError(null);
            }}
          />
          <span>Scan QR</span>
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "manual"}
            onChange={() => {
              closeScanner();
              setMode("manual");
              setError(null);
            }}
          />
          <span>Manual Pay</span>
        </label>
      </div>

      {mode === "scan" && status !== "PENDING" && status !== "PROCESSING" && !scanMode && (
        <button type="button" onClick={openScanner} disabled={!apiReady}>
          Open Camera &amp; Scan QR
        </button>
      )}

      {mode === "scan" && scanMode && (
        <div className="qr-scanner-panel">
          <video
            ref={videoRef}
            className="qr-scanner-video"
            autoPlay
            playsInline
            muted
          />
          {scanHint && <p className="qr-scan-hint">{scanHint}</p>}
          <button type="button" className="qr-close-btn" onClick={closeScanner}>
            Close Camera
          </button>
        </div>
      )}

      {error && <p className="qr-scan-error">{error}</p>}

      {mode === "manual" && status !== "PENDING" && status !== "PROCESSING" && (
        <>
          <div className="form-group">
            <label>Pay to VPA:</label>
            <input
              value={toVpa}
              onChange={(e) => setToVpa(e.target.value)}
              placeholder={vendorVpa}
            />
          </div>
          <div className="form-group">
            <label>Amount (₹):</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button type="button" onClick={manualPay} disabled={!apiReady}>
            Proceed Payment
          </button>
        </>
      )}

      {(status === "PENDING" || status === "PROCESSING") && (
        <div className="txn-card">
          <p>
            Paying ₹{amount} to {toVpa}
          </p>
          {requestId && (
            <p className="txn-meta">Linked to vendor QR request</p>
          )}
          {status === "PROCESSING" ? (
            <p className="payment-waiting">Processing payment…</p>
          ) : (
            <>
              <div className="form-group">
                <label>Enter UPI PIN (demo PIN: 1234):</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                />
              </div>
              <button type="button" onClick={proceedPayment} disabled={!apiReady}>
                Confirm Payment
              </button>
              <button type="button" className="qr-close-btn" onClick={resetPaymentForm}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {status === "SUCCESS" && (
        <PaymentResult
          success
          message={`Paid ₹${amount} to ${toVpa}`}
          onClose={resetPaymentForm}
        />
      )}
      {status === "FAILED" && (
        <PaymentResult
          success={false}
          message={failureReason || "Payment failed. Check PIN and balance."}
          onClose={resetPaymentForm}
        />
      )}
    </div>
  );
};

const TransactionHistory = () => {
  const { transactions } = useUpi();

  if (!transactions.length) {
    return (
      <div className="txn-history">
        <h4>Recent Transactions</h4>
        <p className="txn-history-empty">No transactions yet. Complete a payment to see history.</p>
      </div>
    );
  }

  return (
    <div className="txn-history">
      <h4>Recent Transactions</h4>
      <ul className="txn-history-list">
        {transactions.map((txn) => (
          <li key={txn.id} className={`txn-history-item txn-${txn.status.toLowerCase()}`}>
            <div>
              <strong>{txn.from}</strong> → <strong>{txn.to}</strong>
            </div>
            <div>₹{txn.amount}</div>
            <div className="txn-history-meta">
              {txn.status} · {txn.timestamp}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const UpiSimulation = () => {
  const [mode, setMode] = useState("vendor");
  const { apiReady, apiError } = useUpi();

  return (
    <div className="upi-sim-wrapper">
      <h2>Sakhi Pay UPI Simulation</h2>

      {!apiReady && apiError && (
        <p className="qr-scan-error upi-api-warning">{apiError}</p>
      )}

      <hr className="section-divider" />

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

      <TransactionHistory />
    </div>
  );
};

export default UpiSimulation;
