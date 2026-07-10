import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";

const UpiContext = createContext();

export const CUSTOMER_VPA = "arjun@sakhipay";
export const VENDOR_VPA = "eshita@sakhipay";
const API_BASE = process.env.REACT_APP_API_URL || "";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const UpiProvider = ({ children }) => {
  const [customerBalance, setCustomerBalance] = useState(0);
  const [vendorBalance, setVendorBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activePaymentRequest, setActivePaymentRequest] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState(null);
  const socketRef = useRef(null);

  const refreshBalances = useCallback(async () => {
    const [customer, vendor] = await Promise.all([
      apiRequest(`/api/balance/${encodeURIComponent(CUSTOMER_VPA)}`),
      apiRequest(`/api/balance/${encodeURIComponent(VENDOR_VPA)}`),
    ]);
    setCustomerBalance(customer.balance);
    setVendorBalance(vendor.balance);
    return { customerBalance: customer.balance, vendorBalance: vendor.balance };
  }, []);

  const recordTransaction = useCallback((txn) => {
    setTransactions((prev) => {
      if (prev.some((item) => item.id === txn.id)) {
        return prev;
      }
      return [txn, ...prev];
    });
  }, []);

  const applyTxnUpdate = useCallback(
    (update) => {
      if (!update) return;

      if (typeof update.customerBalance === "number") {
        setCustomerBalance(update.customerBalance);
      }
      if (typeof update.vendorBalance === "number") {
        setVendorBalance(update.vendorBalance);
      }

      if (update.status === "SUCCESS" || update.status === "FAILED") {
        recordTransaction({
          id: update.txnId,
          from: update.fromVpa,
          to: update.toVpa,
          amount: update.amount,
          status: update.status,
          timestamp: new Date().toLocaleString(),
          failureReason: update.failureReason || null,
        });
      }

      setActivePaymentRequest((prev) => {
        if (!prev) return prev;
        if (update.requestId && prev.requestId !== update.requestId) return prev;
        if (!update.requestId && prev.txnId && prev.txnId !== update.txnId) return prev;
        return {
          ...prev,
          status: update.status,
          txnId: update.txnId || prev.txnId,
          fromVpa: update.fromVpa || prev.fromVpa,
        };
      });
    },
    [recordTransaction]
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await refreshBalances();
        if (active) {
          setApiReady(true);
          setApiError(null);
        }
      } catch (error) {
        if (active) {
          setApiReady(false);
          setApiError(
            error.message ||
              "UPI API is unavailable. Start the backend with npm run dev."
          );
        }
      }
    };

    bootstrap();

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("txn:update", (update) => {
      applyTxnUpdate(update);
    });

    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [applyTxnUpdate, refreshBalances]);

  const createPaymentRequest = useCallback(async (amount) => {
    const request = await apiRequest("/api/payment-request", {
      method: "POST",
      body: JSON.stringify({ vendorVpa: VENDOR_VPA, amount: Number(amount) }),
    });
    setActivePaymentRequest(request);
    return request;
  }, []);

  const pollPaymentRequest = useCallback(async (requestId, { timeoutMs = 120000 } = {}) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const request = await apiRequest(
        `/api/payment-request/${encodeURIComponent(requestId)}`
      );

      setActivePaymentRequest(request);

      if (request.status === "SUCCESS" || request.status === "FAILED") {
        await refreshBalances();
        return request;
      }

      await wait(800);
    }

    throw new Error("Payment request timed out");
  }, [refreshBalances]);

  const pollTransaction = useCallback(async (txnId, { timeoutMs = 15000 } = {}) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const txn = await apiRequest(`/api/txn/${encodeURIComponent(txnId)}`);

      if (txn.status === "SUCCESS" || txn.status === "FAILED") {
        applyTxnUpdate({
          txnId: txn.txnId,
          status: txn.status,
          fromVpa: txn.fromVpa,
          toVpa: txn.toVpa,
          amount: txn.amount,
          requestId: txn.requestId,
          failureReason: txn.failureReason,
        });
        await refreshBalances();
        return txn;
      }

      await wait(500);
    }

    throw new Error("Payment processing timed out");
  }, [applyTxnUpdate, refreshBalances]);

  const initiatePayment = useCallback(async ({ toVpa, amount, requestId }) => {
    return apiRequest("/api/txn/initiate", {
      method: "POST",
      body: JSON.stringify({
        fromVpa: CUSTOMER_VPA,
        toVpa,
        amount: Number(amount),
        requestId: requestId || undefined,
      }),
    });
  }, []);

  const verifyPaymentPin = useCallback(async ({ txnId, pin }) => {
    return apiRequest("/api/txn/verify-pin", {
      method: "POST",
      body: JSON.stringify({ txnId, pin }),
    });
  }, []);

  const completePayment = useCallback(
    async ({ toVpa, amount, requestId, pin }) => {
      const initiated = await initiatePayment({ toVpa, amount, requestId });
      await verifyPaymentPin({ txnId: initiated.txnId, pin });
      return pollTransaction(initiated.txnId);
    },
    [initiatePayment, pollTransaction, verifyPaymentPin]
  );

  const notifyEmail = useCallback(async (payload) => {
    try {
      await apiRequest("/api/notify-email", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // Email is optional in simulation
    }
  }, []);

  const clearActivePaymentRequest = useCallback(() => {
    setActivePaymentRequest(null);
  }, []);

  return (
    <UpiContext.Provider
      value={{
        customerVpa: CUSTOMER_VPA,
        vendorVpa: VENDOR_VPA,
        customerBalance,
        vendorBalance,
        transactions,
        activePaymentRequest,
        apiReady,
        apiError,
        refreshBalances,
        createPaymentRequest,
        pollPaymentRequest,
        pollTransaction,
        initiatePayment,
        verifyPaymentPin,
        completePayment,
        notifyEmail,
        clearActivePaymentRequest,
        applyTxnUpdate,
        recordTransaction,
      }}
    >
      {children}
    </UpiContext.Provider>
  );
};

export const useUpi = () => useContext(UpiContext);
