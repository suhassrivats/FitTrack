"""
AWS Lambda handler for FitTrack API
Uses Mangum to adapt Flask app for Lambda/API Gateway
"""
from mangum import Mangum
from app import app

# Create Lambda handler
# lifespan="off" disables ASGI lifespan events (not needed for Flask)
handler = Mangum(app, lifespan="off")


