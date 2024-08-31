import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/extract-info', upload.single('aadhaarImage'), (req, res) => {
  const imagePath = req.file.path;

  Tesseract.recognize(
    imagePath,
    'eng',
    {
      logger: m => console.log(m), // Optional: log OCR progress
    }
  ).then(({ data: { text } }) => {
    console.log('OCR Text:', text); // Log the full OCR text

    // Regex patterns to extract fields
    const nameMatch = text.match(/^\s*([A-Za-z\s]+)(?:\n|$)/);
    const fatherNameMatch = text.match(/Father:\s*([A-Za-z\s]+)\n/i);
    const dobMatch = text.match(/DOB:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const genderMatch = text.match(/\b(Male|Female)\b/i);
    const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);

    const name = nameMatch ? nameMatch[1].trim() : 'Not found';
    const fatherName = fatherNameMatch ? fatherNameMatch[1].trim() : 'Not found';
    const dob = dobMatch ? dobMatch[1].trim() : 'Not found';
    const gender = genderMatch ? genderMatch[0].trim() : 'Not found';
    const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0] : 'Not found';

    // Clean up: delete the uploaded file after processing
    fs.unlinkSync(imagePath);

    // Return the extracted information as JSON
    res.json({ name, fatherName, dob, gender, aadhaarNumber });
  }).catch(err => {
    res.status(500).json({ error: 'OCR failed', details: err.message });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
