const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for single file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
});

app.post("/api/send", upload.single("file"), async (req, res) => {
  console.log("Received contact form submission");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    companyType,
    description,
    jobTitle,
    country,
    message,
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10s timeout
  });

  const attachments = req.file
    ? [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ]
    : [];

  const mailOptions = {
    from: `"${firstName} ${lastName}" <${email}>`,
    to: process.env.EMAIL_RECEIVER,
    subject: `📥 New Inquiry from the Client: ${firstName} ${lastName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px; border: 1px solid #ddd;">
      <h2 style="color: #007BFF;">📩 New Inquiry Received</h2>
      <hr style="border: none; border-top: 1px solid #ddd;" />

      <h3>Personal Details</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Name:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Country:</strong> ${country}</li>
      </ul>

      <h3>Company Information</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Company Name:</strong> ${company}</li>
        <li><strong>Company Type:</strong> ${companyType}</li>
        <li><strong>Job Title:</strong> ${jobTitle}</li>
      </ul>

      <h3>Description</h3>
      <p style="white-space: pre-line;">${description || "N/A"}</p>

      <h3>How did you hear about Vior?</h3>
      <p style="white-space: pre-line;">${message || "N/A"}</p>

      <h3>Attachments</h3>
      <p>${attachments?.length ? `${attachments.length} file(s) attached.` : "No attachments"}</p>

      <hr style="border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 0.9em; color: #666;">This message was sent from the Vior Contact Form.</p>
    </div>
  `,
    text: `...`,
    attachments,
  };

  try {
    res.json({ success: true, message: "Email sent successfully" });
    console.time("sendMail");
    transporter
      .sendMail(mailOptions)
      .then((info) => console.log("Email sent:", info.response))
      .catch((err) => console.error("Email failed:", err));
    console.timeEnd("sendMail");
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Vior Mail API is running!");
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Mail API running at http://localhost:${PORT}`)
);
