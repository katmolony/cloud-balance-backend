# Cloud Balance - Backend

Cloud Balance is a **Mobile Cloud Resource Manager** that helps students and lecturers monitor AWS costs and resource usage in real time. This is the backend service, built using **FastAPI** and **PostgreSQL**, with AWS integration.

## 🚀 Features
- REST API for tracking AWS resource usage
- PostgreSQL database for storing user data
- Secure authentication (OAuth2 planned)
- AWS Cost Explorer integration for real-time cost tracking
- Deployment-ready with AWS Lambda

## 🛠️ Tech Stack
- **FastAPI** - High-performance API framework
- **PostgreSQL** - Relational database for storage
- **SQLAlchemy & Alembic** - ORM & database migrations
- **AWS Services** - Cost Explorer, CloudWatch (future)
- **Docker (Planned)** - Containerized deployment

## 📦 Installation

### **1️⃣ Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/cloud-balance-backend.git
cd cloud-balance-backend
```

### 2️⃣ Set up virtual environment
```bash
python -m venv venv
source venv/bin/activate  # (Mac/Linux)
venv\Scripts\activate  # (Windows)
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Configure database
Edit .env file with your PostgreSQL credentials:

```bash
DATABASE_URL=postgresql://user:password@localhost/cloud_balance
```

Run migrations:
```bash
alembic upgrade head
```

### 5️⃣ Run the server
```bash
uvicorn main:app --reload
```

API will be available at: http://127.0.0.1:8000

## 📜 API Endpoints

| Method | Endpoint           | Description               |
|--------|--------------------|---------------------------|
| GET    | `/`                | Health check             |
| POST   | `/resource-usage/` | Trasck AWS resource usage |

## 🚀 Deployment (AWS Lambda)
* Planned: Deploy using AWS Lambda + API Gateway.

## 👥 Contributors
Kate Molony - GitHub