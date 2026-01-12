import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText, FileSpreadsheet } from 'lucide-react';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToExcel = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const convertToExcel = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const workbook = XLSX.utils.book_new();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const lines = [];
        let currentLine = [];
        let lastY = null;

        textContent.items.forEach(item => {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            if (currentLine.length > 0) {
              lines.push(currentLine);
              currentLine = [];
            }
          }
          currentLine.push(item.str);
          lastY = item.transform[5];
        });

        if (currentLine.length > 0) {
          lines.push(currentLine);
        }

        const worksheetData = lines.map(line => {
          const row = {};
          line.forEach((cell, idx) => {
            row[`Column${idx + 1}`] = cell;
          });
          return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Page${pageNum}`);
      }

      XLSX.writeFile(workbook, file.name.replace('.pdf', '.xlsx'));

      setLoading(false);
    } catch (err) {
      setError('Error converting PDF to Excel: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          PDF to Excel
        </CardTitle>
        <CardDescription>Pull data straight from PDFs into Excel spreadsheets in a few short seconds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="pdf-to-excel"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-to-excel" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <span className="block text-sm font-medium text-gray-700">
              {file ? file.name : 'Choose PDF file'}
            </span>
            <span className="block text-xs text-gray-500 mt-1">Click to upload PDF</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {file && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                File: <strong className="text-gray-900">{file.name}</strong>
              </p>
            </div>
            <Button onClick={convertToExcel} disabled={loading} className="w-full">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {loading ? 'Converting...' : 'Convert to Excel'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfToExcel;
