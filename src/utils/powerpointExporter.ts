
// PowerPoint Export Utility for Valuation Presentations
// In production, this would integrate with pptxgenjs or similar libraries

export interface PresentationData {
  ticker: string;
  companyName: string;
  analysisDate: string;
  keyMetrics: {
    marketCap: number;
    revenue: number;
    wacc: number;
    beta: number;
  };
  scenarios: Array<{
    name: string;
    priceTarget: number;
    impliedReturn: number;
  }>;
  recommendation: string;
  risks: string[];
  catalysts: string[];
}

export class PowerPointExporter {
  static async generatePresentation(data: PresentationData): Promise<Blob> {
    // In real implementation, would use pptxgenjs to create PowerPoint
    // For now, creating HTML representation that could be converted
    
    const htmlContent = this.generateHTMLPresentation(data);
    return new Blob([htmlContent], { type: 'text/html' });
  }

  private static generateHTMLPresentation(data: PresentationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.ticker} Valuation Analysis</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; }
        .slide { width: 100vw; height: 100vh; padding: 60px; box-sizing: border-box; page-break-after: always; }
        .slide-1 { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; }
        .slide-2, .slide-3, .slide-4 { background: #f8fafc; color: #1e293b; }
        h1 { font-size: 48px; margin-bottom: 20px; }
        h2 { font-size: 36px; margin-bottom: 30px; color: #1e40af; }
        .metric { display: inline-block; margin: 20px; text-align: center; }
        .metric-value { font-size: 32px; font-weight: bold; }
        .metric-label { font-size: 16px; opacity: 0.8; }
        .scenario-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin: 40px 0; }
        .scenario-card { padding: 30px; border-radius: 12px; text-align: center; }
        .bear { background: #fee2e2; border: 2px solid #ef4444; }
        .base { background: #dbeafe; border: 2px solid #3b82f6; }
        .bull { background: #dcfce7; border: 2px solid #22c55e; }
    </style>
</head>
<body>
    <!-- Slide 1: Title -->
    <div class="slide slide-1">
        <h1>${data.ticker} Equity Valuation</h1>
        <h2>DCF Analysis & Investment Recommendation</h2>
        <div style="margin-top: 100px;">
            <p style="font-size: 24px;">Analysis Date: ${data.analysisDate}</p>
            <p style="font-size: 18px; opacity: 0.9;">Professional Investment Banking Analysis</p>
        </div>
    </div>

    <!-- Slide 2: Company Overview & Key Metrics -->
    <div class="slide slide-2">
        <h2>Company Overview & Key Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 50px;">
            <div>
                <h3>Key Financial Metrics</h3>
                <div class="metric">
                    <div class="metric-value">$${(data.keyMetrics.marketCap / 1000).toFixed(1)}T</div>
                    <div class="metric-label">Market Capitalization</div>
                </div>
                <div class="metric">
                    <div class="metric-value">$${(data.keyMetrics.revenue / 1000).toFixed(0)}B</div>
                    <div class="metric-label">Annual Revenue</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${(data.keyMetrics.wacc * 100).toFixed(1)}%</div>
                    <div class="metric-label">WACC</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${data.keyMetrics.beta.toFixed(1)}</div>
                    <div class="metric-label">Beta</div>
                </div>
            </div>
            <div>
                <h3>Investment Highlights</h3>
                <ul style="font-size: 18px; line-height: 1.8;">
                    <li>Market-leading position in core segments</li>
                    <li>Strong free cash flow generation</li>
                    <li>Robust balance sheet and capital allocation</li>
                    <li>Compelling long-term growth opportunities</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Slide 3: DCF Valuation Results -->
    <div class="slide slide-3">
        <h2>DCF Valuation Results</h2>
        <div class="scenario-grid">
            ${data.scenarios.map(scenario => `
                <div class="scenario-card ${scenario.name.toLowerCase()}">
                    <h3>${scenario.name} Case</h3>
                    <div style="font-size: 32px; font-weight: bold; margin: 20px 0;">
                        $${scenario.priceTarget.toFixed(0)}
                    </div>
                    <div style="font-size: 18px;">
                        ${scenario.impliedReturn > 0 ? '+' : ''}${(scenario.impliedReturn * 100).toFixed(1)}% Implied Return
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 50px; text-align: center;">
            <h3>Recommendation: ${data.recommendation}</h3>
            <p style="font-size: 18px; max-width: 800px; margin: 0 auto;">
                Based on our DCF analysis, we believe ${data.ticker} represents an attractive investment opportunity
                with compelling risk-adjusted returns across multiple scenarios.
            </p>
        </div>
    </div>

    <!-- Slide 4: Risk Factors & Catalysts -->
    <div class="slide slide-4">
        <h2>Risk Factors & Investment Catalysts</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 50px;">
            <div>
                <h3 style="color: #ef4444;">Key Risk Factors</h3>
                <ul style="font-size: 18px; line-height: 1.8;">
                    ${data.risks.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            </div>
            <div>
                <h3 style="color: #22c55e;">Investment Catalysts</h3>
                <ul style="font-size: 18px; line-height: 1.8;">
                    ${data.catalysts.map(catalyst => `<li>${catalyst}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div style="margin-top: 80px; text-align: center; padding: 30px; background: #f1f5f9; border-radius: 12px;">
            <h4>Disclaimer</h4>
            <p style="font-size: 14px; color: #64748b;">
                This analysis is for informational purposes only and should not be considered as investment advice.
                Past performance does not guarantee future results. Please consult with a qualified financial advisor.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
