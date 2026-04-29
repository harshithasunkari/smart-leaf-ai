# 🌿 Smart Leaf Treatment Advisor

## **Project Overview**

Smart Leaf Treatment Advisor is an AI-powered agricultural application that helps farmers diagnose crop diseases and receive precise treatment recommendations. The system uses deep learning (CNN ensemble: MobileNet + ResNet50) to analyze leaf images and calculate exact dosages of pesticides based on disease severity and land area.

**Key Features:**
- ✅ AI-powered disease detection (79.74% accuracy)
- ✅ Severity assessment using image processing
- ✅ Automated dosage calculation
- ✅ Multi-language support (English, Hindi, Telugu)
- ✅ Treatment scheduling
- ✅ Diagnosis history tracking
- ✅ Mobile-responsive UI
- ✅ Docker containerization
- ✅ GPU-optimized backend

---

## **Tech Stack**

### **Frontend**
- React 18.3.1 with TypeScript
- Vite (Lightning-fast build tool)
- Tailwind CSS (Utility-first styling)
- React Router v7 (Navigation)
- Fetch API (HTTP requests)

### **Backend**
- Flask 2.3.3 (Python web framework)
- TensorFlow 2.13.0 (Deep learning)
- OpenCV 4.8 (Image processing)
- Gunicorn (WSGI server)
- CORS support for frontend communication

### **ML Models**
- **MobileNet**: Lightweight, real-time inference
- **ResNet50**: High accuracy
- **Ensemble**: Combines both models for better predictions

### **Deployment**
- Docker & Docker Compose
- Containerized frontend & backend
- Optional: Nginx reverse proxy
- Optional: PostgreSQL database
- Redis for caching (optional)

---

## **Project Structure**
