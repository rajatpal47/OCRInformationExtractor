import React, { useState } from 'react';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('aadhaarImage', file);

    try {
      const response = await fetch('http://localhost:5000/extract-info', { // Update with your API endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload Image</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <h3>Extracted Information</h3>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Father's Name:</strong> {result.fatherName}</p>
          <p><strong>DOB:</strong> {result.dob}</p>
          <p><strong>Gender:</strong> {result.gender}</p>
          <p><strong>Aadhaar Number:</strong> {result.aadhaarNumber}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
