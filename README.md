# Image and PDF Compressor

A React-based web application for compressing images and PDFs, and converting between PDF and image formats.

## Features

- 📷 **Image Compression**: Compress JPG, JPEG, PNG, and WebP images with adjustable quality settings
- 📄 **PDF Compression**: Reduce PDF file sizes while maintaining document integrity
- 📄→🖼️ **PDF to Image**: Convert PDF pages to JPG/JPEG or PNG images
- 🖼️→📄 **Image to PDF**: Combine multiple images into a single PDF file

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Image-And-Pdf-Compressor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- **React**: Frontend framework
- **pdf-lib**: PDF manipulation and compression
- **browser-image-compression**: Client-side image compression
- **jsPDF**: PDF generation from images
- **pdfjs-dist**: PDF rendering and conversion to images

## Usage

### Image Compression
1. Click on the "Compress Image" tab
2. Select an image file (JPG, JPEG, PNG, WebP)
3. Adjust the quality slider (10% - 100%)
4. Click "Compress Image"
5. Download the compressed image

### PDF Compression
1. Click on the "Compress PDF" tab
2. Select a PDF file
3. Click "Compress PDF"
4. Download the compressed PDF

### PDF to Image Conversion
1. Click on the "PDF to Image" tab
2. Select a PDF file
3. Choose output format (JPEG or PNG)
4. Adjust quality settings
5. Click "Convert to Images"
6. Download individual pages or all at once

### Image to PDF Conversion
1. Click on the "Image to PDF" tab
2. Select one or multiple image files
3. Reorder images using arrow buttons if needed
4. Click "Convert to PDF"
5. Download the generated PDF

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## License

MIT
