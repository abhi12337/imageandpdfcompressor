import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText, File } from 'lucide-react';

const WordToPdf = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      selectedFile.type === 'application/msword' ||
      selectedFile.name.endsWith('.doc') ||
      selectedFile.name.endsWith('.docx') ||
      selectedFile.name.endsWith('.txt')
    )) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid Word document (.doc, .docx) or text file');
      setFile(null);
    }
  };

  const convertToPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;
      let yPosition = margin;

      pdf.setFontSize(12);

      const lines = text.split('\n');
      
      for (const line of lines) {
        const wrappedLines = pdf.splitTextToSize(line || ' ', maxWidth);
        
        for (const wrappedLine of wrappedLines) {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        }
      }

      pdf.save(file.name.replace(/\.(doc|docx|txt)$/i, '.pdf'));

      setLoading(false);
    } catch (err) {
      setError('Error converting to PDF: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-6 h-6" />
          Word to PDF
        </CardTitle>
        <CardDescription>Make DOC and DOCX files easy to read by converting them to PDF</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="word-to-pdf"
            accept=".doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="word-to-pdf" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <span className="block text-sm font-medium text-gray-700">
              {file ? file.name : 'Choose Word document'}
            </span>
            <span className="block text-xs text-gray-500 mt-1">Click to upload DOC, DOCX or TXT file</span>
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
            <Button onClick={convertToPdf} disabled={loading} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              {loading ? 'Converting...' : 'Convert to PDF'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordToPdf;
