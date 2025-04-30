import { useState } from "react";
import axios from "axios";

export default function Predict() {
  const [context, setContext] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setError(null);
    setPrediction(null);
    try {
      const predictRes = await axios.post("https://ngram-analyzer.onrender.com/predict", new URLSearchParams({ context }));
      const { predicted_word, probability } = predictRes.data;

      let surprisal_bits = null;
      try {
        const surprisalRes = await axios.post("https://ngram-analyzer.onrender.com/surprisal", new URLSearchParams({
          context,
          word: predicted_word
        }));
        surprisal_bits = surprisalRes.data.surprisal_bits;
      } catch {
        surprisal_bits = null;
      }

      setPrediction({ predicted_word, probability, surprisal_bits });
    } catch (err) {
      setError("Prediction failed. Try a different context.");
    }
  };

  return (
    <div style={{
      backgroundColor: '#f3f4f8',
      minHeight: '100vh',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#1e293b'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Predict Next Word</h1>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '600px',
        marginBottom: '1rem'
      }}>
        <input
          type="text"
          placeholder="Enter last (n-1) words AKA context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            minWidth: '250px'
          }}
        />
        <button
          onClick={handlePredict}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Predict
        </button>
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</p>
      )}

      {prediction && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e293b' }}>Prediction Result</h2>
          <p><strong>Predicted Word:</strong> {prediction.predicted_word}</p>
          <p><strong>Probability:</strong> {(prediction.probability * 100).toFixed(2)}%</p>
          <p><strong>Surprisal:</strong> {prediction.surprisal_bits !== null ? `${prediction.surprisal_bits.toFixed(4)} bits` : "N/A"}</p>
        </div>
      )}
    </div>
  );
}
