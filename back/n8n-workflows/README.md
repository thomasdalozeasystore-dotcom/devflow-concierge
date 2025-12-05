# n8n Workflows for DevFlow Concierge

This directory contains 8 n8n workflows (2 per service type) for logging chats and generating requirements.

## Workflows

### Chat Log Workflows
These workflows receive chat messages and store them in PostgreSQL:

1. **chat-log-web-dev.json** - Website Development chat logs
   - Webhook path: `/chat-log-web-dev`
   - Service type: `WEB_DEV`

2. **chat-log-app-dev.json** - Mobile App Development chat logs
   - Webhook path: `/chat-log-app-dev`
   - Service type: `APP_DEV`

3. **chat-log-image-processing.json** - Image Processing chat logs
   - Webhook path: `/chat-log-image-processing`
   - Service type: `IMAGE_PROCESSING`

4. **chat-log-video-services.json** - Video Services chat logs
   - Webhook path: `/chat-log-video-services`
   - Service type: `VIDEO_PROCESSING`

### Generate Requirements Workflows
These workflows use AI to generate structured requirements documents:

1. **generate-requirements-web-dev.json** - Web Development requirements
   - Webhook path: `/generate-requirements-web-dev`
   - Service type: `WEB_DEV`

2. **generate-requirements-app-dev.json** - App Development requirements
   - Webhook path: `/generate-requirements-app-dev`
   - Service type: `APP_DEV`

3. **generate-requirements-image-processing.json** - Image Processing requirements
   - Webhook path: `/generate-requirements-image-processing`
   - Service type: `IMAGE_PROCESSING`

4. **generate-requirements-video-services.json** - Video Services requirements
   - Webhook path: `/generate-requirements-video-services`
   - Service type: `VIDEO_PROCESSING`

## Database Schema

### chat_logs table
```sql
CREATE TABLE IF NOT EXISTS chat_logs (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX idx_chat_logs_service ON chat_logs(service_type);
CREATE INDEX idx_chat_logs_company ON chat_logs(company_name);
```

### requirements table
```sql
CREATE TABLE IF NOT EXISTS requirements (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  requirements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requirements_session ON requirements(session_id);
CREATE INDEX idx_requirements_service ON requirements(service_type);
CREATE INDEX idx_requirements_company ON requirements(company_name);
```

## Setup Instructions

1. **Import workflows to n8n**:
   - Open n8n
   - Go to Workflows
   - Click "Import from File"
   - Select each JSON file

2. **Configure PostgreSQL credentials**:
   - In n8n, go to Credentials
   - Add PostgreSQL credential
   - Replace `REPLACE_WITH_YOUR_POSTGRES_CREDENTIAL_ID` in each workflow

3. **Configure OpenAI credentials** (for generate-requirements workflows):
   - In n8n, go to Credentials
   - Add OpenAI API credential
   - Replace `REPLACE_WITH_YOUR_OPENAI_CREDENTIAL_ID` in each workflow

4. **Create database tables**:
   - Run the SQL schema above in your PostgreSQL database

5. **Update frontend constants**:
   - Update `front/constants.ts` with your n8n webhook URLs

## Webhook URLs

After importing, your webhook URLs will be:
- `https://your-n8n-instance.com/webhook/chat-log-web-dev`
- `https://your-n8n-instance.com/webhook/chat-log-app-dev`
- `https://your-n8n-instance.com/webhook/chat-log-image-processing`
- `https://your-n8n-instance.com/webhook/chat-log-video-services`
- `https://your-n8n-instance.com/webhook/generate-requirements-web-dev`
- `https://your-n8n-instance.com/webhook/generate-requirements-app-dev`
- `https://your-n8n-instance.com/webhook/generate-requirements-image-processing`
- `https://your-n8n-instance.com/webhook/generate-requirements-video-services`

## Request Format

### Chat Log Request
```json
{
  "session_id": "uuid-here",
  "company_name": "Company Name",
  "phone": "+1234567890",
  "role": "user",
  "content": "Message content",
  "timestamp": "2025-12-05T12:00:00Z"
}
```

### Generate Requirements Request
```json
{
  "session_id": "uuid-here",
  "company_name": "Company Name",
  "phone": "+1234567890",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "model", "content": "..." }
  ]
}
```
