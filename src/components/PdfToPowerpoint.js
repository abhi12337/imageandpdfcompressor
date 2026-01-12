import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from 'pptxgenjs';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText, Presentation } from 'lucide-react';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToPowerpoint = () => {
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

  const convertToPowerPoint = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const pptx = new PptxGenJS();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL('image/png');
        
        const slide = pptx.addSlide();
        slide.addImage({
          data: imageData,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
        });
      }

      await pptx.writeFile({ fileName: file.name.replace('.pdf', '.pptx') });

      setLoading(false);
    } catch (err) {
      setError('Error converting PDF to PowerPoint: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Presentation className="w-6 h-6" />
          PDF to PowerPoint
        </CardTitle>
        <CardDescription>Turn your PDF files into easy to edit PPT and PPTX slideshows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="pdf-to-ppt"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-to-ppt" className="cursor-pointer">
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
            <Button onClick={convertToPowerPoint} disabled={loading} className="w-full">
              <Presentation className="w-4 h-4 mr-2" />
              {loading ? 'Converting...' : 'Convert to PowerPoint'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfToPowerpoint;
