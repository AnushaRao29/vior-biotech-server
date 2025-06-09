const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(cors());

// Setup multer for single file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    text: `
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone}
      Company: ${company}
      Company Type: ${companyType}
      Description: ${description}
      Job Title: ${jobTitle}
      Country: ${country}

      How did you hear about Vior?:
      ${message}
          `,
          attachments, // Add the single attachment here
        };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Mail API running at http://localhost:${PORT}`)
);
