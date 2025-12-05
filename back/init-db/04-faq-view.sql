-- Add FAQ view to existing views

-- View for FAQ chats
CREATE OR REPLACE VIEW faq_chats AS
SELECT * FROM chat_logs WHERE service_type = 'FAQ';

-- Grant permissions
GRANT SELECT ON faq_chats TO devflow;
