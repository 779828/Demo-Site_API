// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// // Create Express app
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// // Connect to MongoDB Atlas
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// // Define a Schema for Contact Data
// const contactSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   message: String,
// });

// const Contact = mongoose.model("Contact", contactSchema);

// // API route to save form data to MongoDB
// app.post("/", async (req, res) => {
//   const { name, email, message } = req.body;

//   const newContact = new Contact({
//     name,
//     email,
//     message,
//   });

//   try {
//     await newContact.save();
//     res.status(200).json({ message: "Contact saved successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: "Error saving contact data" });
//   }
// });

// app.get("/", async (req, res) => {
//   try {
//     const contacts = await Contact.find();
//     res.status(200).json(contacts);
//   } catch (error) {
//     console.error("Error fetching contact data:", error);
//     res.status(500).json({ error: "Error fetching contact data" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
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

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Or another email service
  auth: {
    user: "shashankbmusale07@gmail.com",
    pass: "xhwq csrg pdmd femt", // Use app password if 2FA is enabled
  },
});

app.post("/api/send-email", (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: "shashankbmusale07@gmail.com", // Replace with the owner's email
    subject: `New message from ${name}`,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to send email" });
    }
    res.status(200).json({ message: "Email sent successfully" });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
