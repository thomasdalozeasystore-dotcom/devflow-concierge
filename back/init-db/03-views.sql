-- Create views for each service type
-- This allows easy querying while keeping data in one table

-- View for Web Development chats
CREATE OR REPLACE VIEW web_dev_chats AS
SELECT * FROM chat_logs WHERE service_type = 'WEB_DEV';

-- View for App Development chats
CREATE OR REPLACE VIEW app_dev_chats AS
SELECT * FROM chat_logs WHERE service_type = 'APP_DEV';

-- View for Image Processing chats
CREATE OR REPLACE VIEW image_processing_chats AS
SELECT * FROM chat_logs WHERE service_type = 'IMAGE_PROCESSING';

-- View for Video Services chats
CREATE OR REPLACE VIEW video_services_chats AS
SELECT * FROM chat_logs WHERE service_type = 'VIDEO_PROCESSING';

-- Grant permissions
GRANT SELECT ON web_dev_chats TO devflow;
GRANT SELECT ON app_dev_chats TO devflow;
GRANT SELECT ON image_processing_chats TO devflow;
GRANT SELECT ON video_services_chats TO devflow;
