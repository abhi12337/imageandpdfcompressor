import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Upload, FileText } from 'lucide-react';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToWord = () => {
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

  const convertToWord = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      const paragraphs = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        const pageWidth = viewport.width;
        
        // Group text items by vertical position (y-coordinate)
        const lineGroups = new Map();
        
        textContent.items.forEach((item) => {
          const y = Math.round(item.transform[5]);
          const x = item.transform[4];
          const text = item.str.trim();
          const fontName = item.fontName || '';
          const height = item.height || 12;
          const width = item.width || 0;
          
          // Detect bold by font name patterns
          const isBold = fontName.toLowerCase().includes('bold') || 
                        fontName.toLowerCase().includes('black') ||
                        fontName.toLowerCase().includes('heavy');
          
          // Detect italic
          const isItalic = fontName.toLowerCase().includes('italic') || 
                          fontName.toLowerCase().includes('oblique');
          
          if (!text) return;
          
          if (!lineGroups.has(y)) {
            lineGroups.set(y, []);
          }
          
          lineGroups.get(y).push({
            text,
            x,
            height,
            width,
            isBold,
            isItalic,
            fontName
          });
        });

        // Convert to array and sort by y position (top to bottom)
        const lines = Array.from(lineGroups.entries())
          .sort((a, b) => b[0] - a[0]) // PDF coords: higher y = top
          .map(([y, items]) => {
            // Sort items by x position (left to right)
            items.sort((a, b) => a.x - b.x);
            return { y, items };
          });

        // Process each line
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const items = line.items;
          
          if (items.length === 0) continue;
          
          // Calculate line properties
          const lineText = items.map(item => item.text).join(' ').trim();
          if (!lineText) continue;
          
          const avgHeight = items.reduce((sum, item) => sum + item.height, 0) / items.length;
          const firstItemX = items[0].x;
          const totalWidth = items[items.length - 1].x + items[items.length - 1].width - items[0].x;
          const centerX = pageWidth / 2;
          
          // Detect alignment
          const isCentered = Math.abs(firstItemX + totalWidth / 2 - centerX) < 50;
          const isRightAligned = firstItemX > pageWidth * 0.6;
          
          // Detect if this is a heading
          const isLargeText = avgHeight > 16;
          const isAllCaps = lineText === lineText.toUpperCase() && lineText.length < 100;
          const allItemsBold = items.every(item => item.isBold);
          
          // Detect bullet points
          const bulletMatch = lineText.match(/^([•●○■▪▫–—\-\*])\s+(.+)/);
          const isBullet = bulletMatch !== null;
          
          // Check if next line might be an underline
          const hasUnderline = i + 1 < lines.length && 
            lines[i + 1].items.some(item => 
              item.text.includes('_') || item.text === '—' || item.text === '–'
            );
          
          // Build text runs
          const textRuns = [];
          let currentText = '';
          let currentBold = items[0].isBold;
          let currentItalic = items[0].isItalic;
          
          items.forEach((item, idx) => {
            if (idx > 0 && (item.isBold !== currentBold || item.isItalic !== currentItalic)) {
              // Style changed, create a text run
              if (currentText.trim()) {
                textRuns.push(
                  new TextRun({
                    text: currentText,
                    bold: currentBold,
                    italics: currentItalic,
                    size: Math.round(avgHeight * 2),
                  })
                );
              }
              currentText = item.text;
              currentBold = item.isBold;
              currentItalic = item.isItalic;
            } else {
              currentText += (idx > 0 && !item.text.startsWith(' ') ? ' ' : '') + item.text;
            }
          });
          
          // Add the last text run
          if (currentText.trim()) {
            textRuns.push(
              new TextRun({
                text: currentText.trim(),
                bold: currentBold || allItemsBold,
                italics: currentItalic,
                size: Math.round(avgHeight * 2),
              })
            );
          }
          
          // Create paragraph with appropriate formatting
          const paragraph = new Paragraph({
            children: textRuns,
            alignment: isCentered ? 'center' : (isRightAligned ? 'right' : 'left'),
            spacing: {
              before: isLargeText || hasUnderline ? 200 : 80,
              after: isLargeText || hasUnderline ? 150 : 80,
            },
            indent: isBullet ? { left: 720, hanging: 360 } : undefined,
            border: hasUnderline ? {
              bottom: {
                color: "auto",
                space: 1,
                style: "single",
                size: 6,
              }
            } : undefined,
          });
          
          paragraphs.push(paragraph);
          
          // Skip the next line if it was an underline
          if (hasUnderline) {
            i++;
          }
        }

        // Add page break except for last page
        if (pageNum < numPages) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: '', break: 1 })],
            })
          );
        }
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: paragraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, file.name.replace('.pdf', '.docx'));

      setLoading(false);
    } catch (err) {
      setError('Error converting PDF to Word: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          PDF to Word
        </CardTitle>
        <CardDescription>
          Easily convert your PDF files into easy to edit DOC and DOCX documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="pdf-to-word"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="pdf-to-word" className="cursor-pointer flex flex-col items-center gap-2">
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

        {file && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                File: <strong className="text-gray-900">{file.name}</strong>
              </p>
            </div>
            <Button onClick={convertToWord} disabled={loading} className="w-full">
              {loading ? 'Converting...' : 'Convert to Word'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfToWord;
