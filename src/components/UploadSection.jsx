// src/components/UploadSection.jsx
import { useState } from "react";
import axios from "axios";

export default function UploadSection() {
  const [file, setFile] = useState(null);
  const [n, setN] = useState(2);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !n) {
      setError("Please select a file and enter an n-gram value.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("n", n);

    try {
      const response = await axios.post("http://ngram-analyzer.onrender.com/upload", formData);
      setPreview(response.data.preview);
      setError("");
    } catch (err) {
      setError("Failed to upload PDF. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "block", margin: "1rem auto" }}
      />
      <input
        type="number"
        value={n}
        onChange={(e) => setN(e.target.value)}
        placeholder="Enter n-gram size"
        style={{
          padding: "0.6rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          width: "200px",
          marginBottom: "1rem"
        }}
      />
      <br />
      <button
        onClick={handleUpload}
        style={{
          backgroundColor: "#7C3AED",
          color: "white",
          border: "none",
          padding: "0.6rem 1.4rem",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Analyze
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>}

      {preview && (
        <div
          style={{
            marginTop: "2rem",
            background: "#f3f4f6",
            borderRadius: "8px",
            padding: "1.5rem",
            fontSize: "0.95rem",
            color: "#334155",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <strong>Preview:</strong>
          <p>{preview}</p>
        </div>
      )}
    </div>
  );
}
