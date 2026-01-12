import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, Image, Download } from 'lucide-react';

const ImageCompressor = () => {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedFile, setCompressedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [compressedPreview, setCompressedPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState(0.8);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setError('');
      setCompressedFile(null);
      setCompressedSize(0);
      setCompressedPreview(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setError('Please select a valid image file (JPG, JPEG, PNG, WebP)');
      setFile(null);
    }
  };

  const compressImage = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality,
      };

      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
      setCompressedSize(compressed.size);

      // Create compressed preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompressedPreview(reader.result);
      };
      reader.readAsDataURL(compressed);

      setLoading(false);
    } catch (err) {
      setError('Error compressing image: ' + err.message);
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    const fileExtension = file.name.split('.').pop();
    a.download = `compressed_${file.name.replace(`.${fileExtension}`, '')}.${fileExtension}`;
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-6 w-6" />
          Image Compressor
        </CardTitle>
        <CardDescription>
          Compress your images (JPG, JPEG, PNG, WebP) to reduce their size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="image-file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="image-file" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="h-12 w-12 text-gray-400" />
            <span className="text-sm text-gray-600">
              {file ? file.name : 'Choose image file'}
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
            
            <div className="space-y-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                id="quality"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {preview && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={preview} alt="Original" className="max-w-full h-auto" />
              </div>
            )}

            <Button onClick={compressImage} disabled={loading} className="w-full">
              {loading ? 'Compressing...' : 'Compress Image'}
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

            {compressedPreview && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={compressedPreview} alt="Compressed" className="max-w-full h-auto" />
              </div>
            )}

            <Button onClick={downloadCompressed} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageCompressor;
