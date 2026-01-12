import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText, Download } from 'lucide-react';

const PdfCompressor = () => {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedFile, setCompressedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setError('');
      setCompressedFile(null);
      setCompressedSize(0);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const compressPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      // Save with compression
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      setCompressedFile(blob);
      setCompressedSize(blob.size);
      setLoading(false);
    } catch (err) {
      setError('Error compressing PDF: ' + err.message);
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const compressionRatio = originalSize && compressedSize 
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1) 
    : 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          PDF Compressor
        </CardTitle>
        <CardDescription>
          Compress your PDF files to reduce their size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="pdf-file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-file" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="h-12 w-12 text-gray-400" />
            <span className="text-sm text-gray-600">
              {file ? file.name : 'Choose PDF file'}
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {file && !compressedFile && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Original Size: <strong className="text-gray-900">{formatFileSize(originalSize)}</strong>
              </p>
            </div>
            <Button onClick={compressPdf} disabled={loading} className="w-full">
              {loading ? 'Compressing...' : 'Compress PDF'}
            </Button>
          </div>
        )}

        {compressedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <span className="block text-xs text-gray-500 mb-1">Original</span>
                <span className="text-lg font-semibold">{formatFileSize(originalSize)}</span>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <span className="block text-xs text-gray-500 mb-1">Compressed</span>
                <span className="text-lg font-semibold text-green-600">{formatFileSize(compressedSize)}</span>
              </div>
            </div>
            <p className="text-center text-sm">
              Size reduced by <strong className="text-green-600">{compressionRatio}%</strong>
            </p>
            <Button onClick={downloadCompressed} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfCompressor;
