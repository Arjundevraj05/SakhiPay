import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// AWS SES Configuration
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "your-access-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "your-secret-key",
  },
});

// Gmail SMTP Configuration
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Email simulation function for testing
function simulateEmailSending(fromUser, toUser, amount, txnId) {
  console.log("\n" + "=".repeat(60));
  console.log("📧 EMAIL NOTIFICATION SENT");
  console.log("=".repeat(60));
  console.log(`To: ${fromUser.email}`);
  console.log(`From: noreply@sakhipay.com`);
  console.log(`Subject: Payment Confirmation - SakhiPay`);
  console.log("\nDear " + fromUser.name + ",");
  console.log("\nYour payment has been successfully processed!");
  console.log("\nTransaction Details:");
  console.log(`- Amount: ₹${amount}`);
  console.log(`- To: ${toUser.name}`);
  console.log(`- Transaction ID: ${txnId}`);
  console.log(`- Status: SUCCESS`);
  console.log("\nThank you for using SakhiPay!");
  console.log("=".repeat(60) + "\n");
}

// Gmail SMTP email sending function
async function sendEmailViaGmail(fromUser, toUser, amount, txnId) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      to: fromUser.email,
      subject: 'Payment Confirmation - SakhiPay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Payment Confirmation</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; color: #34495e;">Dear ${fromUser.name},</p>
              <p style="font-size: 16px; color: #34495e;">Your payment has been successfully processed!</p>
              
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #27ae60; margin: 0;">Transaction Details:</h3>
                <p style="margin: 10px 0;"><strong>Amount:</strong> ₹${amount}</p>
                <p style="margin: 10px 0;"><strong>To:</strong> ${toUser.name}</p>
                <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${txnId}</p>
                <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #27ae60;">SUCCESS</span></p>
              </div>
              
              <p style="font-size: 14px; color: #7f8c8d;">Thank you for using SakhiPay!</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await gmailTransporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully via Gmail:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Error sending email via Gmail:", error.message);
    throw error;
  }
}

app.use(cors());
app.use(express.json());

const HUGGING_FACE_API_KEY =
  process.env.HUGGINGFACE_API_KEY ||
  process.env.REACT_APP_HUGGINGFACE_API_KEY ||
  process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
const hfClient = HUGGING_FACE_API_KEY ? new InferenceClient(HUGGING_FACE_API_KEY) : null;

const users = {
  "arjun@sakhipay": { name: "Arjun", balance: 2500, email: "arjundevraj05@gmail.com" },
  "eshita@sakhipay": { name: "Eshita", balance: 1800, email: "arjundevraj05@gmail.com" },
};
const txns = {};

// Email sending function
async function sendPaymentConfirmationEmail(fromUser, toUser, amount, txnId) {
  // Check if Gmail credentials are configured
  const hasGmailCredentials = process.env.GMAIL_USER && 
                             process.env.GMAIL_USER !== 'your-email@gmail.com' &&
                             process.env.GMAIL_APP_PASSWORD && 
                             process.env.GMAIL_APP_PASSWORD !== 'your-app-password';

  // Check if AWS credentials are properly configured
  const hasValidCredentials = process.env.AWS_ACCESS_KEY_ID && 
                             process.env.AWS_ACCESS_KEY_ID !== "your-access-key" &&
                             process.env.AWS_SECRET_ACCESS_KEY && 
                             process.env.AWS_SECRET_ACCESS_KEY !== "your-secret-key";

  // Try Gmail first (easier to set up)
  if (hasGmailCredentials) {
    try {
      console.log("📧 Attempting to send email via Gmail...");
      return await sendEmailViaGmail(fromUser, toUser, amount, txnId);
    } catch (error) {
      console.error("❌ Gmail failed, trying AWS SES...");
    }
  }

  // Try AWS SES if Gmail fails or not configured
  if (hasValidCredentials) {
    try {
      console.log("📧 Attempting to send email via AWS SES...");
      const params = {
        Source: process.env.AWS_SES_SENDER || "noreply@sakhipay.com",
        Destination: {
          ToAddresses: [fromUser.email],
        },
        Message: {
          Subject: {
            Data: "Payment Confirmation - SakhiPay",
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: `
                <html>
                  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                      <h2 style="color: #2c3e50; text-align: center;">Payment Confirmation</h2>
                      <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 16px; color: #34495e;">Dear ${fromUser.name},</p>
                        <p style="font-size: 16px; color: #34495e;">Your payment has been successfully processed!</p>
                        
                        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <h3 style="color: #27ae60; margin: 0;">Transaction Details:</h3>
                          <p style="margin: 10px 0;"><strong>Amount:</strong> ₹${amount}</p>
                          <p style="margin: 10px 0;"><strong>To:</strong> ${toUser.name}</p>
                          <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${txnId}</p>
                          <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #27ae60;">SUCCESS</span></p>
                        </div>
                        
                        <p style="font-size: 14px; color: #7f8c8d;">Thank you for using SakhiPay!</p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
              Charset: "UTF-8",
            },
            Text: {
              Data: `
Payment Confirmation - SakhiPay

Dear ${fromUser.name},

Your payment has been successfully processed!

Transaction Details:
- Amount: ₹${amount}
- To: ${toUser.name}
- Transaction ID: ${txnId}
- Status: SUCCESS

Thank you for using SakhiPay!
              `,
              Charset: "UTF-8",
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      const result = await sesClient.send(command);
      console.log("✅ Email sent successfully via AWS SES:", result.MessageId);
      return result;
    } catch (error) {
      console.error("❌ Error sending email via SES:", error.message);
    }
  }

  // Fall back to email simulation
  console.log("⚠️  No email service configured. Using email simulation...");
  simulateEmailSending(fromUser, toUser, amount, txnId);
  return { MessageId: "simulated-" + Date.now() };
}

// register
app.post("/api/register", (req, res) => {
  const { vpa, name, email } = req.body;
  users[vpa] = { name, balance: 2000, email: email || `${name.toLowerCase()}@example.com` };
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
app.post("/api/txn/verify-pin", async (req, res) => {
  const { txnId, pin } = req.body;
  const txn = txns[txnId];
  if (!txn) return res.status(404).json({ error: "Invalid txn" });

  setTimeout(async () => {
    if (pin === "1234" && users[txn.fromVpa].balance >= txn.amount) {
      users[txn.fromVpa].balance -= txn.amount;
      users[txn.toVpa].balance += txn.amount;
      txn.status = "SUCCESS";
      io.emit("txn:update", { txnId, status: "SUCCESS" });
      
      // Send email confirmation
      try {
        const fromUser = users[txn.fromVpa];
        const toUser = users[txn.toVpa];
        await sendPaymentConfirmationEmail(fromUser, toUser, txn.amount, txnId);
        console.log(`Payment confirmation email sent for transaction ${txnId}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the transaction if email fails
      }
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

// Analyze spending sentiment with FinBERT (server-side to avoid browser CORS/token issues)
app.post("/api/analyze-expenses", async (req, res) => {
  try {
    const { text } = req.body || {};

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Expense text is required for analysis." });
    }

    if (!HUGGING_FACE_API_KEY) {
      return res.status(500).json({
        error: "Hugging Face API key is missing on server.",
      });
    }

    const data = await hfClient.textClassification({
      model: "ProsusAI/finbert",
      inputs: text,
    });

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(502).json({ error: "Invalid response format from FinBERT." });
    }

    const sentimentArray = data;
    const highestConfidenceSentiment = sentimentArray.reduce((prev, curr) =>
      prev.score > curr.score ? prev : curr
    );

    let sentimentDescription = "";
    switch (highestConfidenceSentiment?.label) {
      case "positive":
        sentimentDescription =
          "Your spending behavior looks positive! It indicates a well-balanced financial approach.";
        break;
      case "neutral":
        sentimentDescription =
          "Your spending pattern is stable. Consider reviewing it periodically for financial health.";
        break;
      case "negative":
        sentimentDescription =
          "Your expenses might indicate financial stress. Try tracking and optimizing your spending.";
        break;
      default:
        sentimentDescription = "Analysis inconclusive. Try adding more expenses for better insights.";
    }

    return res.json({
      sentiment: highestConfidenceSentiment?.label || "unknown",
      score: highestConfidenceSentiment?.score ?? 0,
      analysis: sentimentDescription,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
});

server.listen(4000, () => console.log("UPI Simulator API running on 4000"));
