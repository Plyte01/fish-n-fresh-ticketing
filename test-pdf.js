// Test PDF generation locally
const { jsPDF } = require('jspdf');
const fs = require('fs');

console.log('Testing jsPDF...');

try {
  const pdf = new jsPDF();
  
  pdf.setFontSize(16);
  pdf.text('Test PDF Generation', 20, 30);
  pdf.setFontSize(12);
  pdf.text('This is a test to verify PDF generation works correctly.', 20, 50);
  
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  
  console.log('PDF Buffer length:', pdfBuffer.length);
  console.log('PDF Buffer first 10 bytes:', pdfBuffer.slice(0, 10));
  console.log('PDF Buffer starts with PDF header:', pdfBuffer.toString('ascii', 0, 4) === '%PDF');
  
  // Write to file for inspection
  fs.writeFileSync('test-output.pdf', pdfBuffer);
  console.log('Test PDF written to test-output.pdf');
  
} catch (error) {
  console.error('Error generating test PDF:', error);
}
