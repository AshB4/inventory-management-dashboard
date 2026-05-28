# ATLAS Robotics Supply

AI-assisted robotics inventory operations platform for catalog control, stock visibility, and workflow automation.

## Hero

ATLAS Robotics Supply is a full-stack internal operations platform built to help robotics teams manage product inventory with speed, accuracy, and clear operational insight.

The platform combines a React dashboard, Flask API, database-backed inventory records, and n8n automation workflows. Its built-in AI assistant, **A.R.I.A.** (Atlas Robotics Inventory Assistant), helps users query live inventory data through natural language.

The application is designed for AWS EC2 deployment, with the production React build served through Flask and automation workflows supporting inventory intelligence and operational response.

## Live Demo

[LIVE_DEMO_PLACEHOLDER: Add deployed AWS URL]

## Features

- CRUD inventory management for robotics product records
- AI-assisted inventory queries through A.R.I.A.
- Low stock visibility and inventory health monitoring
- Operational dashboard metrics for catalog count, stock risk, and inventory value
- Audit-ready structure for inventory operations and future event logging
- Responsive UI for desktop and mobile workflows
- Accessibility-conscious interface patterns
- Keyboard navigation support for core UI flows
- AWS-ready deployment architecture
- n8n workflow automation for inventory intelligence

## Tech Stack

### Frontend

- React
- JavaScript
- CSS
- Responsive dashboard components
- Accessibility-conscious form and interaction patterns

### Backend

- Flask
- Flask-CORS
- Flask-SQLAlchemy
- REST API endpoints
- Production-ready WSGI deployment with Gunicorn

### Database

- SQLite for local development
- PostgreSQL-ready architecture for production scaling

### Automation

- n8n workflows
- AI Agent workflow orchestration
- OpenAI-powered natural language inventory assistance
- HTTP tool integrations with the Flask API

### Deployment

- AWS EC2
- Gunicorn
- Nginx reverse proxy
- Production React build served through Flask

## Architecture Overview

```text
User
  |
  v
React Dashboard
  |
  |-- Inventory CRUD / Metrics
  |      |
  |      v
  |   Flask REST API
  |      |
  |      v
  |   SQLite / PostgreSQL
  |
  |-- A.R.I.A. Chat Assistant
         |
         v
      n8n Chat Trigger
         |
         v
      n8n AI Agent
         |
         v
      Flask Inventory API Tools
         |
         v
      Live Inventory Response
```

## Accessibility Considerations

- Semantic HTML structure for dashboard, forms, tables, and dialogs
- Keyboard navigation support for critical inventory workflows
- Accessible forms with clear labels and validation feedback
- Focus-visible states for interactive controls
- Contrast-aware UI styling for readability
- Screen-reader-conscious labels, status messaging, and interaction patterns

## A.R.I.A. Assistant

**A.R.I.A.** stands for **Atlas Robotics Inventory Assistant**.

A.R.I.A. helps users ask natural language questions about live inventory data. The assistant connects through n8n workflows and calls the Flask API tools to retrieve real product, stock, and catalog information.

Example prompts:

- "How many products are in inventory?"
- "Which products are low in stock?"
- "Show inventory for servo motors."
- "What is the total inventory value?"
- "What is the most expensive product?"

## Automation Workflow

ATLAS Robotics Supply uses n8n workflows to connect inventory operations with AI-assisted automation.

The automation layer supports:

- Natural language inventory queries
- Live API calls into the product catalog
- Low stock monitoring workflows
- Operational alert foundations
- Workflow-driven inventory intelligence

n8n acts as the orchestration layer between the A.R.I.A. assistant, OpenAI model reasoning, and the Flask backend API.

## AWS Deployment

The application is designed for deployment on AWS EC2.

Production deployment plan:

- Build the React frontend with `npm run build`
- Serve the compiled React application through Flask
- Run Flask with Gunicorn
- Use Nginx as a reverse proxy
- Configure EC2 security groups for web traffic
- Route a production subdomain to the EC2 instance

In production, Flask hosts both:

- the REST API under `/api/*`
- the compiled React user interface

## Screenshots

[SCREENSHOT_PLACEHOLDER: Dashboard Overview]



[SCREENSHOT_PLACEHOLDER: Inventory Table]



[SCREENSHOT_PLACEHOLDER: Product Form]



[SCREENSHOT_PLACEHOLDER: A.R.I.A. Assistant]



[SCREENSHOT_PLACEHOLDER: Mobile Responsive Layout]



## Local Development Setup

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python app.py
```

The backend runs on:

```text
http://127.0.0.1:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

### Production Frontend Build

```bash
cd frontend
npm run build
```

The Flask backend is configured to serve the production React build from `frontend/build`.

### n8n Setup

```bash
n8n start
```

The n8n editor runs on:

```text
http://localhost:5678
```

The A.R.I.A. workflow should be active and configured with the Chat Trigger URL used by the frontend.

## Future Improvements

- Full RBAC implementation for admin and viewer roles
- Advanced analytics for inventory health and catalog performance
- Inventory trend reporting over time
- Enhanced accessibility auditing with automated checks
- Expanded audit logging for product lifecycle events
- Notification workflows for low stock and out-of-stock thresholds
- PostgreSQL migration for production data durability

## Repository Structure

```text
/
├── frontend/
│   ├── public/
│   └── src/
├── backend/
│   ├── models/
│   ├── static/
│   └── templates/
├── n8n_workflows/
│   └── workflow exports
├── screenshots/
│   └── project screenshots
├── n8n_workflow.json
├── n8n_dashboard_webhook_workflow.json
└── README.md
```

## Product Summary

ATLAS Robotics Supply demonstrates a modern operations platform built around inventory accuracy, workflow automation, and AI-assisted decision support.

The system brings together a responsive dashboard, live backend API, database persistence, n8n workflow orchestration, and A.R.I.A. to create a practical internal SaaS-style experience for robotics inventory teams.
