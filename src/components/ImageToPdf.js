import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, Image as ImageIcon, FileText, ArrowUp, ArrowDown, X } from 'lucide-react';

const ImageToPdf = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPG, JPEG, PNG, WebP)');
      return;
    }

    setFiles(imageFiles);
    setError('');

    // Create previews
    const previewPromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            dataUrl: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(setPreviews);
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const moveImage = (index, direction) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    [newPreviews[index], newPreviews[targetIndex]] = [newPreviews[targetIndex], newPreviews[index]];
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const pdf = new jsPDF();
      let firstPage = true;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = previews[i].dataUrl;

        // Load image to get dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });

        // Calculate dimensions to fit the page
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        imgWidth = imgWidth * ratio;
        imgHeight = imgHeight * ratio;

        // Center the image on the page
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        if (!firstPage) {
          pdf.addPage();
        }
        firstPage = false;

        pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
      }

      pdf.save('converted_images.pdf');
      setLoading(false);
    } catch (err) {
      setError('Error converting images to PDF: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Image to PDF Converter
        </CardTitle>
        <CardDescription>Convert multiple JPG/JPEG/PNG images to a single PDF file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="images-to-pdf"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="images-to-pdf" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <span className="block text-sm font-medium text-gray-700">
              {files.length > 0 ? `${files.length} image(s) selected` : 'Choose image files (multiple)'}
            </span>
            <span className="block text-xs text-gray-500 mt-1">Click to upload images</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {previews.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              💡 You can reorder images by using the arrow buttons
            </div>

            <div className="space-y-3">
              {previews.map((preview, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                  <img src={preview.dataUrl} alt={preview.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{preview.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      size="sm"
                      variant="outline"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === previews.length - 1}
                      size="sm"
                      variant="outline"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => removeImage(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={convertToPdf} disabled={loading} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              {loading ? 'Converting...' : `Convert ${files.length} Image(s) to PDF`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageToPdf;
