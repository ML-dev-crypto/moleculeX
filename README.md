# MoleculeX 🧬# MoleculeX 🧬



AI-powered pharmaceutical intelligence platform for discovering clinical trials, analyzing patent landscapes, and exploring scientific literature.**AI-Driven Pharmaceutical Insight Discovery Platform**



---MoleculeX is a sophisticated web application that leverages multi-agent AI systems to analyze pharmaceutical opportunities, clinical trials, patents, and market intelligence. Built with FastAPI and React, it provides real-time analysis with beautiful animations and downloadable PDF reports.



## 🚀 Quick Start---



### Backend## 🎯 Features

```bash

cd backend- **Multi-Agent Analysis**: Master agent orchestrates specialized workers (Clinical Trials, Patent, Web Intelligence)

python -m venv venv- **Real-Time Updates**: WebSocket-powered live progress tracking

venv\Scripts\activate  # Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate- **Clinical Trial Data**: Live integration with ClinicalTrials.gov API

pip install -r requirements.txt- **Beautiful UI**: Smooth Framer Motion animations with TailwindCSS styling

uvicorn main:app --reload- **PDF Reports**: Comprehensive analysis reports with professional formatting

```- **No Database Required**: Simple JSON file-based job storage

Backend runs at: **http://localhost:8000**  - **No Docker Required**: Easy local setup and deployment

API docs: **http://localhost:8000/docs**

---

### Frontend

```bash## 🏗️ Architecture

cd frontend

npm install### Backend (FastAPI)

npm run dev```

```backend/

Frontend runs at: **http://localhost:5173**├── main.py                 # FastAPI app entry point

├── routes.py              # API endpoints

---├── models.py              # Pydantic data models

├── job_manager.py         # Job lifecycle management

## ✨ Features├── master_agent.py        # Master orchestrator

├── websocket_manager.py   # WebSocket connection handler

- 🔬 **Clinical Trials Search** - Live ClinicalTrials.gov integration├── report_generator.py    # PDF generation

- 📄 **Patent Analysis** - Patent landscape insights├── agents/

- 🌐 **Web Intelligence** - Scientific literature analysis│   ├── clinical_trials_agent.py  # ClinicalTrials.gov integration

- 📊 **Real-time Updates** - WebSocket-powered progress tracking│   ├── patent_agent.py           # Patent search (placeholder)

- 📈 **PDF Reports** - Professional analysis reports│   └── web_intel_agent.py        # Web intelligence (placeholder)

- 🎨 **Beautiful UI** - Smooth animations with Framer Motion├── templates/

│   └── report_template.html      # Jinja2 PDF template

---└── data/

    ├── jobs/              # Job state (JSON files)

## 🏗️ Project Structure    └── reports/           # Generated PDF reports

```

```

moleculeX/### Frontend (React + Vite)

├── backend/              # FastAPI backend```

│   ├── main.py          # Application entryfrontend/

│   ├── agents/          # Specialized agents├── src/

│   ├── data/            # Jobs & reports│   ├── App.jsx                    # Main application

│   └── templates/       # PDF templates│   ├── components/

└── frontend/            # React frontend│   │   ├── QueryCard.jsx         # Query input with examples

    └── src/│   │   ├── AgentStatusRow.jsx    # Agent progress chips

        ├── components/  # UI components│   │   ├── ResultsPanel.jsx      # Results display

        ├── api/         # API client│   │   └── ReportDownload.jsx    # PDF download button

        └── App.jsx      # Main app│   ├── api/

```│   │   └── client.js             # Axios API client

│   └── hooks/

---│       └── useWebSocket.js       # WebSocket hook

├── index.html

## 📖 Usage├── vite.config.js

├── tailwind.config.js

1. **Enter Query**: Type your pharmaceutical research question└── package.json

2. **Watch Progress**: Real-time agent status updates```

3. **Review Results**: Interactive results with detailed insights

4. **Download Report**: Get professionally formatted PDF---



### Example Queries## 🚀 Quick Start

- "Which respiratory diseases show low competition but high patient burden in India?"

- "What are emerging opportunities in cardiovascular drug development?"### Prerequisites

- "Find unmet medical needs in oncology with recent patent activity"- Python 3.9+

- Node.js 18+

---- npm or yarn



## 🔌 Key API Endpoints### Backend Setup



```http1. **Navigate to backend directory:**

POST /api/query          # Submit new query   ```bash

GET  /api/status/{id}    # Get job status   cd backend

GET  /api/result/{id}    # Get results   ```

WS   /ws/jobs/{id}       # Real-time updates

GET  /api/reports/{id}   # Download PDF2. **Create virtual environment:**

```   ```bash

   python -m venv venv

Full API documentation: **http://localhost:8000/docs**   ```



---3. **Activate virtual environment:**

   - Windows:

## 🛠️ Tech Stack     ```cmd

     venv\Scripts\activate

- **Backend**: FastAPI, Python 3.11, WebSockets     ```

- **Frontend**: React 18, Vite 5, TailwindCSS 3, Framer Motion   - Mac/Linux:

- **APIs**: ClinicalTrials.gov     ```bash

- **Storage**: JSON-based job storage     source venv/bin/activate

     ```

---

4. **Install dependencies:**

## 🐛 Troubleshooting   ```bash

   pip install -r requirements.txt

**Port already in use:**   ```

```bash

# Windows5. **Run the FastAPI server:**

netstat -ano | findstr :8000   ```bash

taskkill /PID <PID> /F   python main.py

   ```

# Mac/Linux   

lsof -ti:8000 | xargs kill -9   The API will be available at `http://localhost:8000`

```   - API docs: `http://localhost:8000/docs`

   - Health check: `http://localhost:8000/`

**Module not found:**

```bash### Frontend Setup

# Activate venv and reinstall

pip install -r requirements.txt1. **Navigate to frontend directory:**

```   ```bash

   cd frontend

**WebSocket issues:**   ```

- Ensure backend is running on port 8000

- Check browser console for errors2. **Install dependencies:**

   ```bash

---   npm install

   ```

## 📝 License

3. **Run the development server:**

© 2025 MoleculeX. All rights reserved.   ```bash

   npm run dev

---   ```

   

**Built for pharmaceutical researchers with ❤️**   The app will be available at `http://localhost:5173`


---

## 📖 Usage

### 1. Enter Your Query
Type a pharmaceutical research question, such as:
- "Which respiratory diseases show low competition but high patient burden in India?"
- "What are the emerging opportunities in cardiovascular drug development in Asia?"
- "Find unmet medical needs in oncology with recent patent activity"

### 2. Watch Agent Progress
Real-time status updates show each agent's progress:
- 🎯 **Master Agent**: Query analysis and orchestration
- 🔬 **Clinical Trials Agent**: Fetching live data from ClinicalTrials.gov
- 📄 **Patent Agent**: Patent landscape analysis
- 🌐 **Web Intel Agent**: Market intelligence gathering

### 3. Review Results
Interactive results panel with:
- Executive summary
- Key findings
- Clinical trials table
- Patent landscape
- Web intelligence sources

### 4. Download Report
Get a professionally formatted PDF report with all findings.

---

## 🔌 API Endpoints

### Query Submission
```http
POST /api/query
Content-Type: application/json

{
  "query": "Your pharmaceutical research question"
}

Response: {
  "job_id": "uuid",
  "status": "queued",
  "message": "Query submitted successfully",
  "created_at": "2024-01-01T00:00:00"
}
```

### Job Status
```http
GET /api/status/{job_id}

Response: {
  "job_id": "uuid",
  "status": "running",
  "query": "...",
  "agents": [...],
  "progress": 45,
  "created_at": "...",
  "updated_at": "..."
}
```

### Job Results
```http
GET /api/result/{job_id}

Response: {
  "job_id": "uuid",
  "query": "...",
  "executive_summary": "...",
  "key_findings": [...],
  "clinical_trials": [...],
  "patents": [...],
  "web_intel": [...],
  "report_url": "/api/reports/job_{id}.pdf"
}
```

### WebSocket
```javascript
ws://localhost:8000/ws/jobs/{job_id}

Messages: {
  "job_id": "uuid",
  "event_type": "agent_update",
  "data": {...},
  "timestamp": "..."
}
```

### Download Report
```http
GET /api/reports/job_{job_id}.pdf
```

---

## 🎨 UI Components

### QueryCard
- Large textarea for query input
- 4 example queries with click-to-fill
- Animated submit button with loading state

### AgentStatusRow
- 4 agent status chips with icons
- Color-coded status (idle/running/completed/failed)
- Pulse animation for running agents
- Result count display

### ResultsPanel
- Slide-in animation from right
- Collapsible sections
- Interactive data tables
- Color-coded trial statuses

### ReportDownload
- Pulsing download button
- Animated PDF icon
- One-click report download

---

## 🔧 Configuration

### Backend Configuration
Edit `backend/main.py`:
```python
# CORS origins
allow_origins=["http://localhost:5173", "http://localhost:3000"]

# Server port
uvicorn.run("main:app", host="0.0.0.0", port=8000)
```

### Frontend Configuration
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': 'ws://localhost:8000'
  }
}
```

---

## 🧪 Testing Example Queries

1. **Competition Analysis:**
   ```
   Which respiratory diseases show low competition but high patient burden in India?
   ```

2. **Opportunity Detection:**
   ```
   What are the emerging opportunities in cardiovascular drug development?
   ```

3. **Clinical Trial Analysis:**
   ```
   Show me clinical trials for diabetes treatments with less than 5 active competitors
   ```

4. **Market Research:**
   ```
   Find unmet medical needs in oncology with recent patent activity
   ```

---

## 📊 Data Sources

### Phase 1 (Current)
- ✅ **ClinicalTrials.gov API**: Live clinical trial data (no API key required)
- 🔄 **Patent Agent**: Placeholder with dummy data
- 🔄 **Web Intel Agent**: Placeholder with dummy data

### Future Enhancements
- 🔮 USPTO Patent API integration
- 🔮 PubMed/NIH research paper analysis
- 🔮 WHO disease burden statistics
- 🔮 FDA drug approval databases

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" error:**
```bash
# Ensure virtual environment is activated
# Then reinstall dependencies
pip install -r requirements.txt
```

**"Port 8000 already in use":**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

**PDF generation fails:**
```bash
# Install WeasyPrint dependencies (Windows)
# WeasyPrint requires GTK3
# Fallback to xhtml2pdf will be used automatically
```

### Frontend Issues

**"npm install" fails:**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

**WebSocket connection fails:**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify WebSocket URL in `useWebSocket.js`

---

## 🚢 Deployment

### Backend Deployment
```bash
# Production server
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm install -g serve
serve -s dist -p 5173
```

---

## 📝 License

MIT License - feel free to use this for your pharmaceutical research projects!

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional worker agents (Patent API, PubMed integration)
- Enhanced NLP for query parsing
- Database integration for job persistence
- User authentication and history
- Export to multiple formats (Excel, CSV)
- Advanced data visualization charts

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check API documentation at `/docs`
- Review logs in backend console

---

**Built with ❤️ for pharmaceutical researchers**

*MoleculeX - Discovering pharmaceutical insights through AI-powered multi-agent analysis*
