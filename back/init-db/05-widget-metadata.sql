-- Add metadata column to chat_logs for widget-specific data
ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_metadata ON chat_logs USING GIN (metadata);

-- Create view for widget chats
CREATE OR REPLACE VIEW widget_chats AS
SELECT * FROM chat_logs WHERE service_type = 'WIDGET';

-- Grant permissions
GRANT SELECT ON widget_chats TO devflow;

-- Example metadata structure:
-- {
--   "page_url": "https://example.com/pricing",
--   "website_domain": "example.com",
--   "user_agent": "Mozilla/5.0...",
--   "referrer": "https://google.com",
--   "widget_version": "1.0.0",
--   "ip_address": "192.168.1.1"
-- }
