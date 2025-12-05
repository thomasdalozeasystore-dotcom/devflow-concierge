# Easy Tech Chat Widget

Embeddable chat widget for websites - allows visitors to ask questions and get instant responses.

## 📦 Files

- **widget.js** - Main widget JavaScript
- **widget.css** - Widget styles
- **demo.html** - Demo page showing integration

## 🚀 Quick Start

### 1. Add to your website

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://yoursite.com/widget.css">

<!-- Include JS -->
<script src="https://yoursite.com/widget.js"></script>

<!-- Initialize -->
<script>
  EasyTechChat.init({
    apiUrl: 'http://localhost:5000',
    position: 'bottom-right',
    primaryColor: '#6366f1'
  });
</script>
```

### 2. Configuration Options

```javascript
{
  apiUrl: 'http://localhost:5000',     // Backend API URL
  position: 'bottom-right',            // 'bottom-right' or 'bottom-left'
  primaryColor: '#6366f1',             // Widget color
  title: 'Chat with us',               // Header title
  subtitle: 'We reply quickly'         // Header subtitle
}
```

## 📊 Database Integration

All chats are saved to PostgreSQL `chat_logs` table with:
- `service_type = 'WIDGET'`
- `metadata` JSONB column containing:
  - `page_url` - Where the chat happened
  - `website_domain` - Client's domain
  - `user_agent` - Browser info
  - `referrer` - How they found the page
  - `widget_version` - Widget version

### Query Examples

```sql
-- View all widget chats
SELECT * FROM widget_chats;

-- View with metadata
SELECT 
  session_id, 
  content, 
  metadata->>'page_url' as page,
  metadata->>'website_domain' as domain
FROM chat_logs 
WHERE service_type = 'WIDGET';

-- Count chats by domain
SELECT 
  metadata->>'website_domain' as domain,
  COUNT(*) as total_chats
FROM chat_logs 
WHERE service_type = 'WIDGET'
GROUP BY metadata->>'website_domain';
```

## 🧪 Testing

1. Open `demo.html` in your browser
2. Click the chat button in bottom-right
3. Send a message
4. Check PostgreSQL:
   ```sql
   SELECT * FROM widget_chats ORDER BY created_at DESC LIMIT 10;
   ```

## 🎨 Customization

### Colors
Change `primaryColor` in init config

### Position
Set `position` to `'bottom-right'` or `'bottom-left'`

### Styling
Edit `widget.css` to customize appearance

## 🔌 API Endpoints

### POST /api/widget/chat
Send a message

**Request:**
```json
{
  "session_id": "widget_123_abc",
  "message": "Hello!",
  "metadata": {
    "page_url": "https://example.com/pricing",
    "website_domain": "example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response here",
  "session_id": "widget_123_abc"
}
```

### GET /api/widget/history/:sessionId
Get chat history

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-12-05T15:00:00Z",
      "metadata": {...}
    }
  ]
}
```

## 📈 Features

✅ Easy integration (3 lines of code)  
✅ Persistent chat history  
✅ Mobile responsive  
✅ Customizable colors  
✅ Automatic session management  
✅ Metadata tracking  
✅ PostgreSQL storage  
✅ Real-time responses
