import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app, { attachSocket } from "./app.mjs";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

attachSocket(io);

server.listen(PORT, () => {
  console.log(`SakhiPay API running on http://localhost:${PORT}`);
});
