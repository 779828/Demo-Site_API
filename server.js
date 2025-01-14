const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://shashankbmusale07:2AMSdIVVsVPMlaE7@cluster.nmv4o.mongodb.net/Contact?retryWrites=true&w=majority&appName=Cluster"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define a Schema for Contact Data
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.model("Contact", contactSchema);

// API route to save form data to MongoDB
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const newContact = new Contact({
    name,
    email,
    message,
  });

  try {
    await newContact.save();
    res.status(200).json({ message: "Contact saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving contact data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
