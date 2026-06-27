# Smart Legume Leaf Advisor

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-FF6F00.svg)

A comprehensive web-based agricultural application designed to help farmers detect diseases in legume crops at an early stage and obtain appropriate treatment recommendations.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Supported Crops & Diseases](#supported-crops--diseases)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Support](#support)

## 🎯 Overview

Smart Legume Leaf Advisor combines disease detection, treatment recommendations, and pesticide dosage guidance in a single platform. Using CNN-based image classification, the system analyzes leaf images to identify diseases affecting Bean, Cowpea, Pea, and Soybean crops.

### Problem Statement

Legume crops are vulnerable to various diseases that can significantly impact yield and quality. Farmers often struggle to:
- **Identify diseases at early stages** - Symptoms can be difficult to recognize without expert knowledge
- **Access expert guidance** - Limited availability of agricultural experts in remote areas
- **Apply correct pesticide dosages** - Improper application leads to crop damage or ineffective treatment
- **Track disease patterns** - No organized records make it difficult to prevent recurring issues
- **Make informed decisions** - Delayed diagnosis results in crop losses and reduced productivity

This application provides an intelligent, automated solution that analyzes leaf conditions, predicts diseases, and recommends treatments within seconds.

## ✨ Key Features

### 1. Single Image Disease Detection
- Upload a single leaf image with crop details
- Instant disease prediction with confidence score
- Severity level assessment
- Pesticide recommendations
- **Perfect for**: Quick field checks and spot diagnosis

**Inputs:**
- Leaf image
- Crop name
- Growth stage

**Outputs:**
- Predicted disease
- Severity level
- Recommended pesticide

### 2. Multi-Image Batch Detection
- Analyze 2-5 leaf images for comprehensive field assessment
- Dominant disease identification across the field
- Soil type and land area considerations
- Automated dosage calculations

**Inputs:**
- 2–5 leaf images
- Soil type
- Land area
- Growth stage

**Outputs:**
- Dominant disease identification
- Severity assessment
- Recommended pesticide
- Calculated dosage based on field conditions

**Use Case:** Perfect for larger fields where disease symptoms may vary across plants

### 3. Pesticide Recommendation System
- Direct access to treatment recommendations without image upload
- Comprehensive dosage calculations
- Spray intervals and safety information
- Customized based on crop conditions

**Inputs:**
- Disease name
- Crop name
- Soil type
- Land area
- Growth stage

**Outputs:**
- Recommended pesticide
- Dosage quantity
- Spray interval
- Safety precautions
- Application instructions

### 4. Diagnosis History & Tracking
- Maintain records of previous diagnoses
- Search and filter by crop type or disease
- Review earlier recommendations
- Track disease occurrences over time for pattern analysis

**Features:**
- View past scans with timestamps
- Advanced search functionality
- Export diagnosis records
- Historical trend analysis

## 🌱 Supported Crops & Diseases

### Bean (4 classes)
- Bean Blight
- Bean Mosaic Virus
- Bean Rust
- Healthy Bean Leaf

### Cowpea (4 classes)
- Cowpea Bacterial Wilt
- Cowpea Mosaic Virus
- Cowpea Septoria Leaf Spot
- Healthy Cowpea Leaf

### Pea (4 classes)
- Pea Downy Mildew
- Pea Leaf Miner
- Pea Powdery Mildew
- Healthy Pea Leaf

### Soybean (7 classes)
- Soybean Bacterial Pustule
- Soybean Frogeye Leaf Spot
- Soybean Rust
- Soybean Sudden Death Syndrome
- Soybean Target Leaf Spot
- Soybean Yellow Mosaic
- Healthy Soybean Leaf

**Total: 19 disease classes**

## 🏗️ Project Structure

```
smart-leaf-ai/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # Main application entry
│   │   ├── config.py                # Configuration settings
│   │   ├── database.py              # Database setup & SQLAlchemy
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── diagnosis.py         # Diagnosis record model
│   │   │   └── recommendation.py    # Recommendation model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User schemas
│   │   │   ├── diagnosis.py         # Diagnosis schemas
│   │   │   └── recommendation.py    # Recommendation schemas
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── diagnosis.py         # Disease detection endpoints
│   │   │   ├── recommendations.py   # Recommendation endpoints
│   │   │   ├── history.py           # History endpoints
│   │   │   └── health.py            # Health check endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # Authentication logic
│   │   │   ├── disease_service.py   # Disease detection logic
│   │   │   ├── recommendation_service.py  # Recommendation logic
│   │   │   └── image_service.py     # Image processing utilities
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── model_loader.py      # Load pre-trained CNN model
│   │   │   ├── predictor.py         # Prediction logic
│   │   │   └── preprocessing.py     # Image preprocessing pipeline
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── security.py          # JWT and password utilities
│   │   │   ├── constants.py         # Application constants
│   │   │   └── validators.py        # Input validation
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── cors.py              # CORS configuration
│   ├── migrations/                  # Alembic database migrations
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_diagnosis.py
│   │   └── test_recommendations.py
│   ├── models/                      # Pre-trained ML models
│   │   └── legume_disease_model.h5
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variables template
│   ├── main.py                      # Application entry point
│   └── README.md                    # Backend-specific documentation
│
├── fronted/                         # React Frontend (note: typo in folder name)
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── styles/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── diagnosis/
│   │   │   │   ├── SingleImageUpload.tsx
│   │   │   │   ├── MultiImageUpload.tsx
│   │   │   │   ├── DiagnosisResult.tsx
│   │   │   │   └── DiagnosisForm.tsx
│   │   │   ├── recommendations/
│   │   │   │   ├── RecommendationForm.tsx
│   │   │   │   ├── RecommendationResult.tsx
│   │   │   │   └── DosageCalculator.tsx
│   │   │   ├── history/
│   │   │   │   ├── DiagnosisHistory.tsx
│   │   │   │   ├── HistoryCard.tsx
│   │   │   │   └── SearchHistory.tsx
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── StatisticsCard.tsx
│   │   │       └── RecentActivity.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DiagnosisPage.tsx
│   │   │   ├── RecommendationPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/
│   │   │   ├── api.ts              # API client configuration
│   │   │   ├── auth.ts             # Authentication services
│   │   │   ├── diagnosis.ts        # Diagnosis services
│   │   │   ├── recommendation.ts   # Recommendation services
│   │   │   └── storage.ts          # Local storage utilities
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDiagnosis.ts
│   │   │   └── useHistory.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── DiagnosisContext.tsx
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── favicon.ico
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── README.md
│
├── docs/                            # Documentation
│   ├── API.md                       # API endpoints and usage
│   ├── SETUP.md                     # Detailed setup instructions
│   ├── ARCHITECTURE.md              # System architecture details
│   ├── MODEL_TRAINING.md            # ML model training guide
│   ├── DEPLOYMENT.md                # Production deployment
│   └── TROUBLESHOOTING.md           # Common issues and solutions
│
├── scripts/                         # Utility scripts
│   ├── setup_database.py
│   ├── train_model.py
│   └── seed_data.py
│
├── .github/
│   ├── workflows/
│   │   ├── backend-tests.yml
│   │   ├── frontend-tests.yml
│   │   └── deploy.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── PROJECT_DOCUMENTATION.md
```

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────┐
│         Frontend Layer (React + TypeScript)       │
│  - User Interface & Authentication              │
│  - Image Upload & Result Display                │
│  - History Management & Search                  │
└────────────────────┬─────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼─────────────────────────────┐
│      Backend Layer (FastAPI + SQLAlchemy)        │
│  - API Endpoints & Request Handling             │
│  - User Management & JWT Auth                   │
│  - Data Validation & Business Logic             │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼──────────┐
│   ML Module      │    │  Database Layer    │
│ (TensorFlow)     │    │ (SQLite/PostgreSQL)│
│  - CNN Model     │    │  - Users           │
│  - Prediction    │    │  - Diagnoses       │
│  - Preprocessing │    │  - Recommendations│
└──────────────────┘    └────────────────────┘
```

### Component Responsibilities

**Frontend Layer:**
- User authentication and registration
- Image capture and upload interface
- Dashboard and analytics display
- Recommendation presentation
- Diagnosis history management
- Real-time UI updates

**Backend Layer:**
- RESTful API endpoints
- Disease prediction coordination
- Recommendation generation engine
- User authentication and authorization
- Database operations and migrations
- JWT token management

**ML Module:**
- Image preprocessing and normalization
- CNN-based feature extraction
- Disease classification
- Confidence score generation
- Severity level assessment

**Database Layer:**
- User account management
- Diagnosis record storage
- Recommendation history
- Persistent data management

## 📦 Prerequisites

- **Python 3.9+** - For backend development
- **Node.js 16+** and npm - For frontend development
- **Git** - Version control
- **SQLite** or **PostgreSQL** - Database
- **At least 2GB RAM** - For ML model loading and inference
- **Modern web browser** - Chrome, Firefox, Safari, or Edge

### Optional
- **Docker & Docker Compose** - For containerized deployment
- **PostgreSQL** - For production-grade database

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/harshithasunkari/smart-leaf-ai.git
cd smart-leaf-ai
```

### 2. Backend Setup

#### Windows

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv legume_env

# Activate virtual environment
legume_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Resolve bcrypt compatibility (if needed)
pip uninstall bcrypt -y
pip install bcrypt==3.2.0

# Create .env file
copy .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
python -m uvicorn main:app --reload
```

#### macOS/Linux

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv legume_env

# Activate virtual environment
source legume_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
python -m uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (note: folder name is "fronted")
cd fronted

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## ⚙️ Configuration

### Backend `.env` Template

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=sqlite:///./legume_advisor.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/legume_advisor

# JWT Configuration
SECRET_KEY=your-super-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ML Model Configuration
MODEL_PATH=./models/legume_disease_model.h5

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Environment Settings
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
```

### Frontend `.env` Template

Create a `.env` file in the `fronted/` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Smart Legume Leaf Advisor
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
```

## 🎮 Running the Application

### Option 1: Using Docker (Recommended for Production)

```bash
# Build and run all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Running Locally (Development)

**Terminal 1 - Start Backend Server:**

```bash
cd backend
legume_env\Scripts\activate  # Windows
# or
source legume_env/bin/activate  # macOS/Linux

python -m uvicorn main:app --reload
```

**Terminal 2 - Start Frontend Development Server:**

```bash
cd fronted
npm run dev
```

Once both servers are running:
- **Frontend:** Open `http://localhost:5173` in your browser
- **Backend:** API available at `http://localhost:8000`
- **API Docs:** Visit `http://localhost:8000/docs`

## 📚 API Documentation

### Interactive API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs` - Interactive API explorer
- **ReDoc:** `http://localhost:8000/redoc` - Alternative API documentation

### Key Endpoints

**Authentication:**
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
GET    /api/auth/me              # Get current user profile
```

**Disease Detection:**
```
POST   /api/diagnosis/single-image    # Single image analysis
POST   /api/diagnosis/batch-images    # Multi-image batch analysis
GET    /api/diagnosis/{id}            # Get diagnosis details
```

**Recommendations:**
```
POST   /api/recommendations/pesticide      # Get pesticide recommendations
GET    /api/recommendations/history        # Get recommendation history
```

**History:**
```
GET    /api/history/diagnoses              # List all diagnoses
GET    /api/history/diagnoses/{id}         # Get specific diagnosis
DELETE /api/history/diagnoses/{id}         # Delete diagnosis record
```

**Health Check:**
```
GET    /api/health                # API health status
```

For complete API documentation with request/response examples, see [API.md](./docs/API.md)

## 💡 Usage Guide

### 1. Single Image Disease Detection

1. **Create an account** or log in
2. Navigate to **"Disease Detection"** → **"Single Image Analysis"**
3. Upload a clear leaf image (JPG, PNG, WebP)
4. Enter crop type and growth stage
5. Click **"Analyze"**
6. View results:
   - Disease name with confidence percentage
   - Severity level (Low, Medium, High)
   - Recommended pesticide
   - Application instructions

### 2. Multi-Image Batch Analysis

1. Navigate to **"Disease Detection"** → **"Batch Analysis"**
2. Upload 2-5 leaf images from different parts of your field
3. Enter:
   - Crop type
   - Soil type (Clay, Loam, Sandy, etc.)
   - Total land area (in hectares)
   - Growth stage (Seedling, Vegetative, Flowering, etc.)
4. Click **"Analyze"**
5. Review results:
   - Dominant disease affecting the field
   - Average severity level
   - Recommended pesticide
   - **Calculated dosage** based on your field size
   - Spray intervals

### 3. Direct Pesticide Recommendations

1. Navigate to **"Get Recommendations"**
2. If you already know the disease, enter:
   - Disease name
   - Crop type
   - Soil type
   - Land area
   - Growth stage
3. Click **"Get Recommendations"**
4. Get detailed information:
   - Recommended pesticide(s)
   - Dosage per hectare
   - Dilution ratio
   - Spray interval (days between applications)
   - Safety precautions
   - Weather conditions for application

### 4. View & Manage Diagnosis History

1. Navigate to **"History"**
2. Browse all previous diagnoses with:
   - Diagnosis date and time
   - Crop type and disease
   - Severity assessment
3. **Search functionality:**
   - Filter by crop type
   - Filter by disease name
   - Search by date range
4. Click on any record to:
   - View original analysis
   - Review recommendations
   - See results comparison over time
5. Export records for record-keeping

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Activate virtual environment
legume_env\Scripts\activate  # Windows
# or
source legume_env/bin/activate  # macOS/Linux

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd fronted

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- DiagnosisResult.test.tsx
```

## 📖 Additional Documentation

- [API Documentation](./docs/API.md) - Complete REST API reference with examples
- [Setup Guide](./docs/SETUP.md) - Detailed installation and configuration
- [System Architecture](./docs/ARCHITECTURE.md) - In-depth architecture explanation
- [Model Training](./docs/MODEL_TRAINING.md) - Guide to training ML models
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-leaf-ai.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes and commit**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure tests pass

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 🚀 Future Enhancements

- [ ] **Mobile Application** - React Native app for iOS/Android
- [ ] **Weather Integration** - Weather-based treatment recommendations
- [ ] **Offline Mode** - Run predictions without internet connection
- [ ] **Advanced Analytics** - Dashboard with crop health trends and predictive analytics
- [ ] **Multi-Language Support** - Regional language translations (Hindi, Spanish, etc.)
- [ ] **IoT Integration** - Support for smart sensors and automated monitoring
- [ ] **Farmer Community** - Forum for farmers to share experiences and tips
- [ ] **SMS/WhatsApp Alerts** - Notification system for critical issues
- [ ] **Expanded Crop Support** - Support for additional crops (Wheat, Corn, Rice, etc.)
- [ ] **Video Analysis** - Real-time disease detection from video feeds
- [ ] **AI-Powered Advisory** - Personalized farmer recommendations based on history
- [ ] **Government Integration** - Connect with agricultural departments for subsidies

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

Need help? Here are your options:

1. **Check Documentation**
   - Review [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
   - Check [API Documentation](./docs/API.md)

2. **Search Existing Issues**
   - Visit [GitHub Issues](https://github.com/harshithasunkari/smart-leaf-ai/issues)
   - Check if your issue is already reported

3. **Create a New Issue**
   - [Report a Bug](https://github.com/harshithasunkari/smart-leaf-ai/issues/new?template=bug_report.md)
   - [Request a Feature](https://github.com/harshithasunkari/smart-leaf-ai/issues/new?template=feature_request.md)

4. **Contact**
   - Email: support@smartlegumeleaf.com
   - GitHub: [@harshithasunkari](https://github.com/harshithasunkari)

## 👨‍💻 Author

**Harshitha Sunkari**
- GitHub: [@harshithasunkari](https://github.com/harshithasunkari)
- Repository: [smart-leaf-ai](https://github.com/harshithasunkari/smart-leaf-ai)

## 🙏 Acknowledgments

- **FastAPI** team for the excellent async web framework
- **TensorFlow** team for deep learning capabilities
- **React** team for the powerful UI library
- **SQLAlchemy** team for elegant ORM
- Agricultural experts for domain knowledge and guidance
- All contributors and supporters of this project

## 📊 Project Statistics

- **19** disease classes supported
- **4** legume crops covered
- **Multi-language** ready for localization
- **RESTful API** with comprehensive documentation
- **Modern UI** with responsive design

---

**Made with ❤️ for Sustainable Agriculture and Farmer Empowerment**

*Last Updated: 2026* | *Version 1.0.0*
