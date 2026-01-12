import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText, Download, Image as ImageIcon } from 'lucide-react';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToImage = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.9);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setImages([]);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const convertPdfToImages = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const imageDataList = [];

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

        // Convert canvas to blob
        const blob = await new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            `image/${format}`,
            quality
          );
        });

        imageDataList.push({
          blob,
          dataUrl: canvas.toDataURL(`image/${format}`, quality),
          pageNum,
        });
      }

      setImages(imageDataList);
      setLoading(false);
    } catch (err) {
      setError('Error converting PDF to images: ' + err.message);
      setLoading(false);
    }
  };

  const downloadImage = (image) => {
    const url = URL.createObjectURL(image.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_page_${image.pageNum}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllImages = () => {
    images.forEach((image) => {
      setTimeout(() => downloadImage(image), 100 * image.pageNum);
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          PDF to Image Converter
        </CardTitle>
        <CardDescription>Convert PDF pages to JPG or PNG images</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="pdf-to-image"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-to-image" className="cursor-pointer">
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

        {file && images.length === 0 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="jpeg"
                  checked={format === 'jpeg'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">JPEG/JPG</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="png"
                  checked={format === 'png'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">PNG</span>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="pdf-quality" className="block text-sm font-medium text-gray-700">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                id="pdf-quality"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Button onClick={convertPdfToImages} disabled={loading} className="w-full">
              <ImageIcon className="w-4 h-4 mr-2" />
              {loading ? 'Converting...' : 'Convert to Images'}
            </Button>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ Successfully converted {images.length} page{images.length > 1 ? 's' : ''} to {format.toUpperCase()}
            </div>
            
            <Button onClick={downloadAllImages} className="w-full" variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download All Images ({images.length})
            </Button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.pageNum} className="border rounded-lg p-3 space-y-2">
                  <img src={image.dataUrl} alt={`Page ${image.pageNum}`} className="w-full h-auto rounded" />
                  <p className="text-sm text-center text-gray-600">Page {image.pageNum}</p>
                  <Button onClick={() => downloadImage(image)} className="w-full" size="sm">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfToImage;
