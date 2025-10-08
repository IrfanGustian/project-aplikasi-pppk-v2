require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// app.set('trust proxy', true);
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(cors());
app.use(express.json());

let credentials;
const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

// try {
//   if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
//     credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
//   } else if (fs.existsSync(path.resolve(keyPath))) {
//     credentials = require(path.resolve(keyPath));
//   } else {
//     throw new Error('Google service account key not found. Please set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.');
//   }
// } catch (error) {
//   console.error('Error loading service account credentials:', error.message);
//   process.exit(1);
// }

// const jwtClient = new google.auth.JWT(
//   credentials.client_email,
//   null,
//   credentials.private_key,
//   ['https://www.googleapis.com/auth/drive.readonly'],
//   null
// );

// jwtClient.authorize((err) => {
//   if (err) {
//     console.error('Failed to authorize Google Drive API:', err);
//   } else {
//     console.log('Google Drive API authorized successfully!');
//   }
// });

// const drive = google.drive({ version: 'v3', auth: jwtClient });

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 50,
    message: 'Terlalu banyak permintaan dari IP ini, coba lagi setelah 15 menit.'
});


app.get('/api/rekap', apiLimiter, async (req, res) => {
  const { nip } = req.query;
  const GITHUB_REKAP_URL = `https://raw.githubusercontent.com/IrfanGustian/data-download-link-pppk/refs/heads/main/hasil_rekap.json?v=${Date.now()}`;

  try {
    const response = await axios.get(GITHUB_REKAP_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    const rekapData = response.data;

    if (nip) {
      const filteredData = rekapData.find(item => item.NIP === nip);
      if (filteredData) {
        res.json(filteredData);
      } else {
        res.status(404).json({ message: 'Data tidak ditemukan untuk NO Peserta yang dimasukkan.' });
      }
    } else {
      res.json(rekapData);
    }
  } catch (error) {
    console.error('Error fetching rekap data:', error);
    res.status(500).json({ error: 'Gagal mengambil data rekapitulasi.' });
  }
});

app.get('/api/rekap/:nip', apiLimiter, async (req, res) => {
    const { nip } = req.params;
    const GITHUB_REKAP_URL = `https://raw.githubusercontent.com/IrfanGustian/data-download-link-pppk/refs/heads/main/hasil_rekap.json?v=${Date.now()}`;

    if (!nip) {
        return res.status(400).json({ message: 'NIP harus disediakan.' });
    }

    try {
        const response = await axios.get(GITHUB_REKAP_URL, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
        const rekapData = response.data;

        const foundData = rekapData.find(item => item.NIP === nip);

        if (foundData) {
            // Defensively replace http with https to prevent any mixed content issues.
            const secureDownloadLink1 = foundData.downloadlink1 ? foundData.downloadlink1.replace('http://', 'https://') : null;
            const secureDownloadLink2 = foundData.downloadlink2 ? foundData.downloadlink2.replace('http://', 'https://') : null;
            const secureDownloadLink3 = foundData.downloadlink3 ? foundData.downloadlink3.replace('http://', 'https://') : null;

            res.json({
                nip: foundData.NIP,
                downloadlink1: secureDownloadLink1,
                downloadlink2: secureDownloadLink2,
                downloadlink3: secureDownloadLink3,
            });
        } else {
            res.status(404).json({ message: 'Data tidak ditemukan untuk NO Peserta yang dientry.' });
        }
    } catch (error) {
        console.error('Error fetching rekap data:', error);
        res.status(500).json({ error: 'Gagal mengambil data rekapitulasi.' });
    }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});




// app.get('/api/download-file/:nip', apiLimiter, async (req, res) => {
//   console.log('Received request for NIP:', req.params.nip);
//   const { nip } = req.params;
//   const folderIds = [
//     process.env.GOOGLE_DRIVE_FOLDER_ID1,
//     process.env.GOOGLE_DRIVE_FOLDER_ID2,
//     process.env.GOOGLE_DRIVE_FOLDER_ID3
//   ];

//   if (folderIds.some(id => !id)) {
//     return res.status(500).json({ error: 'One or more Google Drive Folder IDs are not configured on the server.' });
//   }

//   if (!/^\d+$/.test(nip)) {
//     return res.status(400).json({ message: 'NO PESERTA HARUS BERUPA ANGKA.' });
//   }

//   const searchFile = async (folderId) => {
//     if (!folderId) return null;
//     const q = `'${folderId}' in parents and name starts with '${nip}.'`;
//     try {
//       const response = await drive.files.list({
//         q: q,
//         fields: 'files(id, name)',
//         spaces: 'drive',
//         pageSize: 1,
//       });
//       const files = response.data.files;
//       if (files.length === 0) {
//         return null;
//       }
//       // The query is `name starts with`, so the first result is sufficient.
//       return files[0];
//     } catch (error) {
//       console.error(`Error searching in folder ${folderId}:`, error);
//       // Return null or throw a more specific error to be handled by Promise.allSettled
//       return null;
//     }
//   };

//   try {
//     const searchPromises = folderIds.map(id => searchFile(id));
//     const results = await Promise.all(searchPromises);

//     const [foundFile1, foundFile2, foundFile3] = results;

//     if (!foundFile1 && !foundFile2 && !foundFile3) {
//       return res.status(404).json({ message: 'FILE TIDAK DITEMUKAN UNTUK NO PESERTA YANG DIMASUKKAN.' });
//     }

//     const createDownloadLink = (file) => file ? `https://docs.google.com/uc?export=download&id=${file.id}` : null;

//     res.json({
//       fileName1: foundFile1 ? foundFile1.name : null,
//       downloadLink1: createDownloadLink(foundFile1),
//       fileName2: foundFile2 ? foundFile2.name : null,
//       downloadLink2: createDownloadLink(foundFile2),
//       fileName3: foundFile3 ? foundFile3.name : null,
//       downloadLink3: createDownloadLink(foundFile3),
//     });

//   } catch (error) {
//     console.error('Error during parallel file search:', error);
//     res.status(500).json({ error: 'Failed to retrieve file from Google Drive. Please try again later.' });
//   }
// });