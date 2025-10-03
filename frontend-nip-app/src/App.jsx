// src/App.jsx (atau src/App.tsx)
import React, { useState } from 'react';
import './App.css';
import axios from 'axios'; // Make sure axios is installed: npm install axios

function App() {
  const [nip, setNip] = useState('');
  const [downloadLink1, setDownloadLink] = useState('');
  const [downloadLink2, setDownloadLink2] = useState('');
  const [downloadLink3, setDownloadLink3] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDownloadLink('');
    setDownloadLink2('');
    setDownloadLink3('');
    setMessage('');

    try {
      // Use axios directly, the response object is structured differently than fetch
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // const response = await axios.get(`${apiUrl}/api/download-file/${nip}`);
      const response = await axios.get(`${apiUrl}/api/rekap/${nip}`);

      // Axios puts the JSON response body directly into response.data
      const data = response.data; // This is the crucial change!

      console.log('Response data:', data); // Log the response data for debugging

      // Axios throws an error for non-2xx status codes by default,
      // so if we reach here, it means the request was successful (2xx status).
      setDownloadLink(data.downloadlink1);
      //setMessage(`File ditemukan: ${data.fileName}`);
      setMessage(`File ditemukan:`);

      setDownloadLink2(data.downloadlink2);
      //setMessage(`File 2 ditemukan: ${data.fileName2}`);

      setDownloadLink3(data.downloadlink3);
      //setMessage(`File 3 ditemukan: ${data.fileName3}`);

    } catch (error) {
      console.error('Error fetching download link:', error);

      // Handle Axios errors (e.g., 404, 500, network errors)
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message || error.response.data.error || 'Terjadi kesalahan pada server.';
        setMessage(errorMessage);
        console.error('Server response error data:', error.response.data); // Log actual error from backend
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        setMessage('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      } else {
        // Something else happened in setting up the request that triggered an Error
        setMessage('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/BKPSDMD.svg" alt="Logo Aplikasi" className="app-logo" />
        <h1>PENCARIAN FILE PERJANJIAN KERJA PPPK</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="Masukkan NO Peserta"
            required
            aria-label="Masukkan NIK"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Mencari...' : 'Cari File'}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        {downloadLink1 && (
          <p>
            <a href={downloadLink1} target="_blank" rel="noopener noreferrer" className="download-button">
              Unduh File PK
            </a>
          </p>
        )}

         {downloadLink2 && (
          <p>
            <a href={downloadLink2} target="_blank" rel="noopener noreferrer" className="download-button">
              Unduh File PAKTA
            </a>
          </p>
        )}

        {downloadLink3 && (
          <p>
            <a href={downloadLink3} target="_blank" rel="noopener noreferrer" className="download-button">
              Unduh File BAP
            </a>
          </p>
        )}
      </header>
    </div>
  );
}

export default App;