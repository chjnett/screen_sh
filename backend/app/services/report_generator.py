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
        """
        try:
            buffer = io.BytesIO()
            
            # Register Korean Font
            font_path = "app/fonts/NanumGothic.ttf"
            try:
                pdfmetrics.registerFont(TTFont('NanumGothic', font_path))
                font_name = 'NanumGothic'
                bold_font = 'NanumGothic' # Using Regular as Bold for MVP if bold ttf not avail
            except Exception as fe:
                print(f"Font loading failed: {fe} - Fallback to Helvetica")
                font_name = 'Helvetica'
                bold_font = 'Helvetica-Bold'

            # Margins
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
            styles = getSampleStyleSheet()
            
            # Update Styles to use Korean Font
            styles['Normal'].fontName = font_name
            styles['Title'].fontName = bold_font
            styles['Heading2'].fontName = bold_font
            
            story = []
            
            # 1. Title
            title_style = styles['Title']
            title_style.textColor = colors.HexColor('#0f4c81') # Classic Blue
            story.append(Paragraph("LogMind Investment Report", title_style))
            story.append(Spacer(1, 12))
            
            # Meta info
            story.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d')} | User: {user_email}", styles['Normal']))
            story.append(Spacer(1, 24))
            
            # 2. Portfolio Overview
            total_value = sum([s['price'] * s['quantity'] for s in stock_details])
            
            story.append(Paragraph("1. Portfolio Overview", styles['Heading2']))
            story.append(Spacer(1, 6))
            story.append(Paragraph(f"<b>Total Assets: ${total_value:,.2f}</b>", styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Chart
            try:
                chart_io = self._generate_chart(stock_details)
                if chart_io:
                    img = Image(chart_io, width=400, height=260)
                    story.append(img)
            except Exception as e:
                story.append(Paragraph(f"[Chart Generation Failed: {e}]", styles['Normal']))
                
            story.append(Spacer(1, 24))
            
            # 3. Asset Details (Table)
            story.append(Paragraph("2. Asset Details", styles['Heading2']))
            story.append(Spacer(1, 12))
            
            table_data = [['Symbol', 'Name', 'Qty', 'Avg Price', 'Current', 'Returns']]
            for s in stock_details:
                # Safe truncating
                name = s.get('name', 'Unknown')
                if len(name) > 15:
                    name = name[:15] + "..."
                    
                row = [
                    s['symbol'],
                    name,
                    f"{s['quantity']}",
                    f"${s['avg_price']:.2f}",
                    f"${s['price']:.2f}",
                    f"{s['profit_rate']}%"
                ]
                table_data.append(row)
                
            # Table Style
            t = Table(table_data, colWidths=[60, 120, 50, 70, 70, 60])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), bold_font), # Dynamic Font
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                ('GRID', (0, 0), (-1, -1), 1, colors.white),
                ('FONTNAME', (0, 1), (-1, -1), font_name), # Dynamic Font
                ('FONTSIZE', (0, 1), (-1, -1), 9),
            ]))
            story.append(t)
            story.append(Spacer(1, 24))
            
            # 4. AI Insight
            story.append(Paragraph("3. AI Analyst Insight", styles['Heading2']))
            story.append(Spacer(1, 6))
            
            # Sanitize Text for PDF (ReportLab limitations on default font)
            # Remove Korean chars temporarily or they will crash or show as squares
            # For MVP, we pass it as is, but catch error if it crashes.
            clean_insight = ai_insight.replace("\n", "<br/>")
            
            # Important: If ai_insight contains Korean, ReportLab with standard font MIGHT crash or show weird boxes.
            # We wrap it or use a safe message if suspected.
            story.append(Paragraph(clean_insight, styles['Normal']))
            
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
