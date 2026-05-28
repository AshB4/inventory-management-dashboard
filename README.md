# Inventory Management Dashboard

## Project Overview

Atlas Robotic Supply is a full-stack inventory management dashboard built for tracking robotics parts, monitoring stock health, and querying inventory data through an n8n-powered assistant workflow. The project combines a Flask API, a React dashboard, SQLite persistence, and an n8n webhook that classifies natural-language inventory questions and routes them to the correct backend endpoint.

## Features

- Responsive React dashboard for inventory operations
- Product creation, editing, and deletion for admin users
- Read-only viewer mode for non-admin access
- Searchable inventory table with category and status visibility
- Analytics cards for total products, low-stock items, and total inventory value
- Modal-based product editing and deletion confirmation
- Atlas Inventory Bot widget for natural-language inventory questions
- n8n workflow that maps user questions to backend inventory endpoints
- Flask serving both API routes and the production React build

## Tech Stack

- Frontend: React 18, React Scripts, CSS
- Backend: Flask, Flask-CORS, Flask-SQLAlchemy
- Database: SQLite
- Automation: n8n webhook workflow
- AI integration: OpenAI Responses API via n8n code node

## Accessibility Features

- Skip link to jump directly to main content
- Semantic landmarks for header, sidebar navigation, and main content
- Screen-reader-only labels for search, role selection, and chatbot input
- `aria-live` feedback for status and success messages
- Dialog semantics with `role="dialog"` and `aria-modal="true"`
- Keyboard support for modal escape, tab trapping, and focus restoration
- Explicit button labels and accessible chatbot toggle states

## API Endpoints

Base API URL: `http://127.0.0.1:5000/api`

- `GET /api/health` - health check
- `GET /api/products` - return all products
- `POST /api/products` - create a product
- `PUT /api/products/<id>` - update a product
- `DELETE /api/products/<id>` - delete a product
- `GET /api/stats/total-products` - return total product count
- `GET /api/stats/low-stock` - return low-stock count
- `GET /api/stats/inventory-value` - return total inventory value
- `GET /api/stats/out-of-stock` - return out-of-stock count
- `GET /api/stats/most-expensive-product` - return the most expensive product

## Installation

### 1. Clone the project

```bash
git clone https://github.com/AshB4/inventory-management-dashboard.git
cd inventory-management-dashboard/capstone-project
```

### 2. Start the Flask backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python app.py
```

The backend runs on `http://127.0.0.1:5000`.

### 3. Start the React frontend

Open a second terminal:

```bash
cd capstone-project/frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

### 4. Optional frontend environment variables

- `REACT_APP_API_BASE` - override the default API base URL
- `REACT_APP_N8N_WEBHOOK_URL` - override the default n8n webhook URL

## Deployment Steps

This project is structured so Flask can serve the built React app in production.

### 1. Build the frontend

```bash
cd frontend
npm install
npm run build
```

### 2. Install backend dependencies

```bash
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
```

### 3. Start the backend server

```bash
python app.py
```

Flask will serve:

- the API under `/api/*`
- the React production build from `frontend/build`
- client-side routes through the SPA fallback

### 4. Deploy notes

- Keep `frontend/build` updated after frontend changes
- Ensure the SQLite file is writable in the deployment environment
- If using the n8n workflow, make sure the deployed workflow can reach the Flask API

## n8n Workflow

The exported workflow lives in [n8n_workflow.json](/Users/ash/inventory-management-dashboard/capstone-project/n8n_workflow.json).

Workflow summary:

1. `Webhook Trigger` accepts `POST` requests on `inventory-helper`
2. `Normalize Input` extracts the incoming question
3. `AI Intent Classifier` uses the OpenAI Responses API to classify the request
4. `Call Flask API` requests the correct backend endpoint
5. `Format Assistant Response` turns the API result into a user-facing answer
6. `Respond to Webhook` returns the final JSON response

Webhook URLs:

- Test URL: `http://localhost:5678/webhook-test/inventory-helper`
- Production URL: `http://localhost:5678/webhook/inventory-helper`

Requirements:

- n8n running on `localhost:5678`
- `OPENAI_API_KEY` available to the n8n process
- Flask backend running on `http://127.0.0.1:5000`

Example request:

```bash
curl -X POST "http://localhost:5678/webhook/inventory-helper" \
  -H "Content-Type: application/json" \
  -d '{"question":"How many products do we have in the catalog?"}'
```

## Screenshots

Add project screenshots here as they become available.

- Dashboard overview
- Product table and analytics cards
- Product edit modal
- Atlas Inventory Bot widget
- n8n workflow canvas

Example markdown:

```md
![Dashboard Overview](./screenshots/dashboard-overview.png)
![Atlas Inventory Bot](./screenshots/inventory-bot.png)
```

## Live URL

Repository: https://github.com/AshB4/inventory-management-dashboard

Deployed app: `Add your live deployment URL here`

## Future Improvements

- Replace SQLite with PostgreSQL for multi-user deployment
- Add authentication and persistent user roles
- Improve n8n workflow response handling for chatbot output
- Add charts for category trends and stock movement over time
- Add test coverage for React components and Flask endpoints
- Add file upload support for bulk inventory imports
