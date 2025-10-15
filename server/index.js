import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const users = {
  "arjun@sakhipay": { name: "Arjun", balance: 2500 },
  "eshita@sakhipay": { name: "Eshita", balance: 1800 },
};
const txns = {};

// register
app.post("/api/register", (req, res) => {
  const { vpa, name } = req.body;
  users[vpa] = { name, balance: 2000 };
  res.json({ ok: true });
});

// initiate txn
app.post("/api/txn/initiate", (req, res) => {
  const { fromVpa, toVpa, amount } = req.body;
  if (!users[fromVpa] || !users[toVpa])
    return res.status(400).json({ error: "Invalid VPA" });

  const txnId = uuidv4();
  txns[txnId] = { txnId, fromVpa, toVpa, amount, status: "PENDING" };
  res.json({ txnId, status: "PENDING" });
});

// verify PIN
app.post("/api/txn/verify-pin", (req, res) => {
  const { txnId, pin } = req.body;
  const txn = txns[txnId];
  if (!txn) return res.status(404).json({ error: "Invalid txn" });

  setTimeout(() => {
    if (pin === "1234" && users[txn.fromVpa].balance >= txn.amount) {
      users[txn.fromVpa].balance -= txn.amount;
      users[txn.toVpa].balance += txn.amount;
      txn.status = "SUCCESS";
      io.emit("txn:update", { txnId, status: "SUCCESS" });
    } else {
      txn.status = "FAILED";
      io.emit("txn:update", { txnId, status: "FAILED" });
    }
  }, 2000);

  res.json({ status: "PROCESSING" });
});

// get balances
app.get("/api/balance/:vpa", (req, res) => {
  res.json(users[req.params.vpa] || {});
});

server.listen(4000, () => console.log("UPI Simulator API running on 4000"));
