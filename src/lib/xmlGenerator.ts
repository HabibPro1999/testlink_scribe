
import { TestCase } from "./types";

export function generateTestLinkXML(testCases: TestCase[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<testcases>`;

  testCases.forEach((testCase, index) => {
    xml += `
  <testcase name="${escapeXml(testCase.title)}">
    <summary><![CDATA[${testCase.summary}]]></summary>
    <preconditions><![CDATA[${testCase.preconditions}]]></preconditions>
    <execution_type>${testCase.executionType === 'Automated' ? '2' : '1'}</execution_type>
    <importance>${mapImportance(testCase.importance)}</importance>
    <steps>`;

    testCase.steps.forEach((step, stepIndex) => {
      xml += `
      <step>
        <step_number>${stepIndex + 1}</step_number>
        <actions><![CDATA[${step}]]></actions>
        <expectedresults><![CDATA[${testCase.expectedResults[stepIndex] || ''}]]></expectedresults>
        <execution_type>1</execution_type>
      </step>`;
    });

    xml += `
    </steps>
  </testcase>`;
  });

  xml += `
</testcases>`;

  return xml;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Map importance values to TestLink numeric format
function mapImportance(importance: string): string {
  switch (importance) {
    case 'Low': return '1';
    case 'Medium': return '2';
    case 'High': return '3';
    default: return '2';
  }
}

// Function to download XML as a file
export function downloadXML(xml: string, filename: string = "testcases.xml"): void {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
