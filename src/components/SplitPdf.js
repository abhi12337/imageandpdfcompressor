import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, Scissors, FileText } from 'lucide-react';

const SplitPdf = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [splitMode, setSplitMode] = useState('all'); // 'all' or 'range'
  const [pageRange, setPageRange] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPageCount(pdf.getPageCount());
      } catch (err) {
        setError('Error reading PDF: ' + err.message);
      }
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const splitPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      if (splitMode === 'all') {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        // Split by range (e.g., "1-3, 5, 7-9")
        const ranges = pageRange.split(',').map(r => r.trim());
        
        for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
          const range = ranges[rangeIndex];
          const newPdf = await PDFDocument.create();
          
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1);
            for (let i = start; i <= end && i < totalPages; i++) {
              const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
              newPdf.addPage(copiedPage);
            }
          } else {
            const pageNum = parseInt(range.trim()) - 1;
            if (pageNum >= 0 && pageNum < totalPages) {
              const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
              newPdf.addPage(copiedPage);
            }
          }

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${file.name.replace('.pdf', '')}_part_${rangeIndex + 1}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setLoading(false);
    } catch (err) {
      setError('Error splitting PDF: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-6 h-6" />
          Split PDF
        </CardTitle>
        <CardDescription>Split PDF into multiple files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="split-pdf"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="split-pdf" className="cursor-pointer">
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
                Total Pages: <strong className="text-gray-900">{pageCount}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="all"
                  checked={splitMode === 'all'}
                  onChange={(e) => setSplitMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Split all pages into separate files</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="range"
                  checked={splitMode === 'range'}
                  onChange={(e) => setSplitMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Split by page range</span>
              </label>
            </div>

            {splitMode === 'range' && (
              <div className="space-y-2">
                <label htmlFor="page-range" className="block text-sm font-medium text-gray-700">
                  Page Range (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  type="text"
                  id="page-range"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="1-3, 5, 7-9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <Button onClick={splitPdf} disabled={loading} className="w-full">
              <Scissors className="w-4 h-4 mr-2" />
              {loading ? 'Splitting...' : 'Split PDF'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitPdf;
