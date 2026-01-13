import io
import base64
import logging
from typing import List, Dict
from datetime import datetime
import matplotlib
matplotlib.use('Agg') # Essential for Docker environments without display
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

logger = logging.getLogger(__name__)

class ReportGenerator:
    """
    Generates Investment PDF Reports using ReportLab (Dependency-free).
    """
    
    def __init__(self, template_dir: str = "app/templates"):
        # ReportLab doesn't use HTML templates directly in this simple mode
        pass

    def _generate_chart(self, items: List[Dict]) -> io.BytesIO:
        """
        Generates a Pie Chart for portfolio allocation and returns BytesIO.
        """
        try:
            labels = [item['symbol'] for item in items]
            sizes = [item['quantity'] * item['current_price'] for item in items]
            
            plt.figure(figsize=(6, 4))
            plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=['#3182f6', '#f04452', '#33c759', '#ffb300'])
            plt.axis('equal') 
            
            img_io = io.BytesIO()
            plt.savefig(img_io, format='png', bbox_inches='tight')
            img_io.seek(0)
            plt.close()
            return img_io
        except Exception as e:
            logger.error(f"Chart generation failed: {e}")
            return None

    def create_pdf(self, 
                   user_email: str, 
                   portfolio_data: Dict, 
                   ai_insight: str, 
                   stock_details: List[Dict]) -> bytes:
        """
        Generates PDF using ReportLab Platypus.
        DEBUG MODE: Returns simple PDF to isolate 500 error causes.
        """
        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            story = []
            
            # Simple Text Only (Ascii)
            story.append(Paragraph("LogMind Investment Report (Debug)", getSampleStyleSheet()['Title']))
            story.append(Spacer(1, 12))
            story.append(Paragraph(f"User: {user_email}", getSampleStyleSheet()['Normal']))
            
            # Try to add Matplotlib chart
            try:
                chart_io = self._generate_chart(stock_details)
                if chart_io:
                    img = Image(chart_io, width=400, height=260)
                    story.append(img)
            except Exception as e:
                story.append(Paragraph(f"Chart Error: {str(e)}", getSampleStyleSheet()['Normal']))

            doc.build(story)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            raise e

# Usage Example
if __name__ == "__main__":
    # Mock Data
    generator = ReportGenerator(template_dir="backend/app/templates") # Path adjustment for local run
    pdf = generator.create_pdf(
        user_email="test@logmind.ai",
        portfolio_data={},
        ai_insight="Market is bullish due to recent AI advancements.",
        stock_details=[
            {"symbol": "AAPL", "name": "Apple Inc", "quantity": 10, "avg_price": 150, "price": 180, "profit_rate": 20, "per": 28.5, "pbr": 12.1, "ai_summary": "Strong buy."},
            {"symbol": "TSLA", "name": "Tesla", "quantity": 5, "avg_price": 250, "price": 200, "profit_rate": -20, "per": 50.1, "pbr": 15.2, "ai_summary": "Wait and see."}
        ]
    )
    
    with open("test_report.pdf", "wb") as f:
        f.write(pdf)
    print("PDF generated successfully: test_report.pdf")
