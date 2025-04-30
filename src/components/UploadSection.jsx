import UploadSection from "../components/UploadSection";

export default function Home({ setNgrams, setPreviewText, previewText }) {
  return (
    <div style={{
      backgroundColor: '#f3f4f8',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      fontFamily: 'system-ui, sans-serif',
      color: '#1e293b',
      paddingTop: '6rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0f0',
        borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>Upload Your PDF</h2>
        <UploadSection
          setPreviewText={setPreviewText}
          setNgrams={setNgrams}
        />
      </div>
    </div>
  );
}
