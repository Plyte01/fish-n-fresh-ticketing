// src/components/admin/PDFTestButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, TestTube } from 'lucide-react';

export function PDFTestButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleTestPdf = async () => {
    setIsGenerating(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/debug/pdf');
      
      if (response.ok) {
        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test-ticket.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setTestResult({
          success: true,
          message: `PDF generated successfully! Size: ${response.headers.get('X-PDF-Size')} bytes`,
          details: {
            size: response.headers.get('X-PDF-Size'),
            valid: response.headers.get('X-PDF-Valid')
          }
        });
      } else {
        const errorData = await response.json();
        setTestResult({
          success: false,
          message: 'PDF generation failed',
          details: errorData
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error during PDF test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTestPdf}
        disabled={isGenerating}
        variant="outline"
        className="flex items-center space-x-2"
      >
        {isGenerating ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        ) : (
          <TestTube className="h-4 w-4" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Test PDF Generation'}</span>
        <Download className="h-4 w-4" />
      </Button>

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="font-medium">
            {testResult.success ? '✅ Success' : '❌ Failed'}
          </div>
          <div className="text-sm mt-1">{testResult.message}</div>
          {testResult.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
