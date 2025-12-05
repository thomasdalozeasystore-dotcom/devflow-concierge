-- Create chat_logs table for storing chat messages
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

-- Create requirements table for storing generated requirements
CREATE TABLE IF NOT EXISTS requirements (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  requirements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_service ON chat_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_chat_logs_company ON chat_logs(company_name);

CREATE INDEX IF NOT EXISTS idx_requirements_session ON requirements(session_id);
CREATE INDEX IF NOT EXISTS idx_requirements_service ON requirements(service_type);
CREATE INDEX IF NOT EXISTS idx_requirements_company ON requirements(company_name);
