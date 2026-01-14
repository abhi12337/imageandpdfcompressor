import React, { useState } from 'react';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './components/ui/Card';
import { ArrowLeft, Files, Scissors, Minimize2, Image as ImageIcon, File, ImagePlus } from 'lucide-react';
import ImageCompressor from './components/ImageCompressor';
import PdfCompressor from './components/PdfCompressor';
import PdfToImage from './components/PdfToImage';
import ImageToPdf from './components/ImageToPdf';
import MergePdf from './components/MergePdf';
import SplitPdf from './components/SplitPdf';

function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState('all');

  const tools = [
    { id: 'mergePdf', name: 'Merge PDF', icon: Files, desc: 'Combine PDFs in the order you want with the easiest PDF merger available', category: 'organize' },
    { id: 'splitPdf', name: 'Split PDF', icon: Scissors, desc: 'Separate one page or a whole set for easy conversion into independent PDF files', category: 'organize' },
    { id: 'pdfCompressor', name: 'Compress PDF', icon: Minimize2, desc: 'Reduce file size while optimizing for maximal PDF quality', category: 'optimize' },
    { id: 'pdfToImage', name: 'PDF to JPG', icon: ImageIcon, desc: 'Convert PDF pages to high-quality JPG or PNG images', category: 'convert' },
    { id: 'imageToPdf', name: 'JPG to PDF', icon: File, desc: 'Convert JPG, PNG and other images to PDF format in seconds', category: 'convert' },
    { id: 'imageCompressor', name: 'Compress Image', icon: ImagePlus, desc: 'Reduce image file size while maintaining quality', category: 'optimize' },
  ];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'organize', name: 'Organize PDF' },
    { id: 'optimize', name: 'Optimize PDF' },
    { id: 'convert', name: 'Convert PDF' },
  ];

  const filteredTools = category === 'all' ? tools : tools.filter(tool => tool.category === category);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-center md:text-left">
              🗜️ PDF Tools
            </h1>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-center md:justify-start">
              <Button 
                className="text-xs sm:text-sm" 
                variant={activeTab === 'all' && category === 'organize' ? 'default' : 'ghost'} 
                onClick={() => { setCategory('organize'); setActiveTab('all'); }}
              >
                ORGANIZE PDF
              </Button>
              <Button 
                className="text-xs sm:text-sm" 
                variant={activeTab === 'all' && category === 'optimize' ? 'default' : 'ghost'} 
                onClick={() => { setCategory('optimize'); setActiveTab('all'); }}
              >
                OPTIMIZE PDF
              </Button>
              <Button 
                className="text-xs sm:text-sm" 
                variant={activeTab === 'all' && category === 'convert' ? 'default' : 'ghost'} 
                onClick={() => { setCategory('convert'); setActiveTab('all'); }}
              >
                CONVERT PDF
              </Button>
              <Button 
                className="text-xs sm:text-sm" 
                variant={activeTab === 'all' && category === 'all' ? 'default' : 'ghost'} 
                onClick={() => { setCategory('all'); setActiveTab('all'); }}
              >
                ALL PDF TOOLS
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {activeTab === 'all' ? (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Every tool you need to work with PDFs in one place
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! 
              Merge, split, compress, convert, rotate, and organize PDFs with just a few clicks.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant="outline"
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => {
              const IconComponent = tool.icon;
              return (
                <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab(tool.id)}>
                  <CardHeader>
                    <div className="mb-3">
                      <IconComponent className="h-12 w-12 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">{tool.name}</CardTitle>
                    <CardDescription>{tool.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setActiveTab('all')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all tools
          </Button>
          <div>
            {activeTab === 'imageCompressor' && <ImageCompressor />}
            {activeTab === 'pdfCompressor' && <PdfCompressor />}
            {activeTab === 'pdfToImage' && <PdfToImage />}
            {activeTab === 'imageToPdf' && <ImageToPdf />}
            {activeTab === 'mergePdf' && <MergePdf />}
            {activeTab === 'splitPdf' && <SplitPdf />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
