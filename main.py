import os
import datetime
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import asyncpg
import boto3

app = FastAPI(title="Cloud Balance Backend", version="0.1")

# Get database connection string from environment or use default for local development
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://clouduser:securepassword@localhost/cloudbalance")

# Async generator for acquiring and closing a PostgreSQL connection using asyncpg
async def get_db_connection():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Data model for cost data
class CostData(BaseModel):
    account_id: str
    resource: str
    cost: float

# Health-check endpoint
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "OK"}

# Endpoint to fetch cost data from PostgreSQL
@app.get("/costs", response_model=list[CostData], tags=["Cost Tracking"])
async def get_costs(conn=Depends(get_db_connection)):
    query = "SELECT account_id, resource, cost FROM cost_data"
    try:
        rows = await conn.fetch(query)
        results = [
            CostData(account_id=row["account_id"], resource=row["resource"], cost=row["cost"])
            for row in rows
        ]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

# Endpoint to trigger an alert (simulation)
@app.post("/alert", tags=["Alerts"])
async def trigger_alert(data: CostData):
    # In a real implementation, integrate with Firebase Cloud Messaging (FCM) to send push notifications.
    return {"message": f"Alert triggered for account {data.account_id} on resource {data.resource} with cost {data.cost}"}

# Endpoint to fetch cost data using AWS Cost Explorer (stub implementation)
@app.get("/aws-cost", tags=["AWS Data"])
async def get_aws_cost():
    # Ensure that AWS credentials are properly configured via environment variables or IAM roles.
    client = boto3.client('ce', region_name='us-east-1')
    today = datetime.datetime.today().strftime("%Y-%m-%d")
    start_date = (datetime.datetime.today() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date,
                'End': today
            },
            Granularity='MONTHLY',
            Metrics=['BlendedCost']
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching AWS cost data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
