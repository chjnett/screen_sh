from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic_settings import BaseSettings
import os
from typing import List
import logging

logger = logging.getLogger(__name__)

# Email Configuration
class EmailSettings(BaseSettings):
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "apikey") # SendGrid/Gmail User
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")       # API Key or App Password
    MAIL_FROM: str = os.getenv("MAIL_FROM", "noreply@logmind.ai")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.sendgrid.net")
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    class Config:
        env_file = ".env"

conf = ConnectionConfig(
    MAIL_USERNAME=EmailSettings().MAIL_USERNAME,
    MAIL_PASSWORD=EmailSettings().MAIL_PASSWORD,
    MAIL_FROM=EmailSettings().MAIL_FROM,
    MAIL_PORT=EmailSettings().MAIL_PORT,
    MAIL_SERVER=EmailSettings().MAIL_SERVER,
    MAIL_STARTTLS=EmailSettings().MAIL_STARTTLS,
    MAIL_SSL_TLS=EmailSettings().MAIL_SSL_TLS,
    USE_CREDENTIALS=EmailSettings().USE_CREDENTIALS,
    VALIDATE_CERTS=EmailSettings().VALIDATE_CERTS
)

class EmailService:
    @staticmethod
    async def send_report_email(email_to: str, pdf_bytes: bytes, filename: str = "Investment_Report.pdf"):
        """
        Sends an email with the PDF report attached.
        """
        try:
            message = MessageSchema(
                subject="[LogMind AI] Your Investment Analysis Report",
                recipients=[email_to],
                body="""
                <html>
                    <body>
                        <h1>Investment Report Ready</h1>
                        <p>Attached is your latest AI-driven portfolio analysis report.</p>
                        <p>Best regards,<br>LogMind AI Team</p>
                    </body>
                </html>
                """,
                subtype=MessageType.html,
                attachments=[(filename, pdf_bytes, "application/pdf")]
            )

            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Email sent successfully to {email_to}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
