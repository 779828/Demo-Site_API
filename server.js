require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// Increase payload size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define a Schema for Contact Data
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  selectedFile: String,
  createdAt: { type: Date, default: new Date() },
});

const Contact = mongoose.model("Contact", contactSchema);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

app.post("/", async (req, res) => {
  const { name, email, message, selectedFile } = req.body;

  if (!name || !email || !message || !selectedFile) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const fileData = selectedFile.split(";base64,");
    if (fileData.length !== 2) {
      return res.status(400).json({ error: "Invalid file format" });
    }

    const mimeType = fileData[0].split(":")[1];
    const fileContent = fileData[1];

    // Validate file type (PDF, DOCX, images)
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const fileSize = (fileContent.length * 3) / 4;
    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
      });
    }

    // Save contact data to MongoDB
    const newContact = new Contact({
      name,
      email,
      message,
      selectedFile,
    });

    await newContact.save();
    res.status(200).json({ message: "Contact saved successfully!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Error saving contact data" });
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shashankbmusale07@gmail.com",
    pass: "xhwq csrg pdmd femt",
  },
});

app.post("/api/send-email", (req, res) => {
  const { name, email, message, selectedFile } = req.body;

  // Validate required fields
  if (!name || !email || !message || !selectedFile) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const fileData = selectedFile.split(";base64,");
    if (fileData.length !== 2) {
      return res.status(400).json({ error: "Invalid file format" });
    }

    const mimeType = fileData[0].split(":")[1];
    const fileContent = fileData[1];

    // Validate file type (PDF, DOCX, images)
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const fileSize = (fileContent.length * 3) / 4;
    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
      });
    }

    // Generate filename
    const fileExtension = mimeType.split("/")[1];
    const filename = `${name.replace(/ /g, "_")}_attachment.${fileExtension}`;

    // Email options
    const mailOptions = {
      to: "shashankbmusale07@gmail.com",
      subject: `New message from ${name}`,
      text: message,
      replyTo: email,
      attachments: [
        {
          filename,
          content: Buffer.from(fileContent, "base64"),
          contentType: mimeType,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      res.status(200).json({ message: "Email sent successfully", info });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).json({ error: "Error fetching contact data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
