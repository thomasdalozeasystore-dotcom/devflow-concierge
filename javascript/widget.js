/**
 * Easy Tech Chat Widget
 * Embeddable chat widget for websites
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // Widget configuration
  const defaultConfig = {
    apiUrl: 'http://localhost:5000',
    position: 'bottom-right',
    primaryColor: '#6366f1',
    title: 'Chat with us',
    subtitle: 'We typically reply in a few minutes'
  };

  // Main widget object
  window.EasyTechChat = {
    config: {},
    sessionId: null,
    isOpen: false,
    messages: [],

    /**
     * Initialize the widget
     */
    init: function(userConfig) {
      this.config = { ...defaultConfig, ...userConfig };
      this.sessionId = this.getOrCreateSessionId();
      this.createWidget();
      this.attachEventListeners();
      this.loadHistory();
    },

    /**
     * Get or create session ID
     */
    getOrCreateSessionId: function() {
      let sessionId = localStorage.getItem('easytech_session_id');
      if (!sessionId) {
        sessionId = 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('easytech_session_id', sessionId);
      }
      return sessionId;
    },

    /**
     * Create widget HTML
     */
    createWidget: function() {
      const widgetHTML = `
        <div id="easytech-chat-widget" class="easytech-widget-${this.config.position}">
          <!-- Chat Button -->
          <button id="easytech-chat-button" class="easytech-chat-button" style="background-color: ${this.config.primaryColor}">
            <svg class="easytech-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg class="easytech-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Chat Window -->
          <div id="easytech-chat-window" class="easytech-chat-window" style="display:none;">
            <!-- Header -->
            <div class="easytech-chat-header" style="background-color: ${this.config.primaryColor}">
              <div>
                <div class="easytech-chat-title">${this.config.title}</div>
                <div class="easytech-chat-subtitle">${this.config.subtitle}</div>
              </div>
              <button id="easytech-close-button" class="easytech-close-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Messages -->
            <div id="easytech-messages" class="easytech-messages"></div>

            <!-- Input -->
            <div class="easytech-input-container">
              <input 
                type="text" 
                id="easytech-message-input" 
                class="easytech-message-input" 
                placeholder="Type your message..."
                autocomplete="off"
              />
              <button id="easytech-voice-button" class="easytech-voice-button" title="Speak">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <button id="easytech-send-button" class="easytech-send-button" style="background-color: ${this.config.primaryColor}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', widgetHTML);
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
      const chatButton = document.getElementById('easytech-chat-button');
      const closeButton = document.getElementById('easytech-close-button');
      const sendButton = document.getElementById('easytech-send-button');
      const voiceButton = document.getElementById('easytech-voice-button');
      const messageInput = document.getElementById('easytech-message-input');

      chatButton.addEventListener('click', () => this.toggleChat());
      closeButton.addEventListener('click', () => this.close());
      sendButton.addEventListener('click', () => this.sendMessage());
      
      // Voice input listener
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        voiceButton.addEventListener('click', () => this.toggleVoice());
      } else {
        voiceButton.style.display = 'none'; // Hide if not supported
      }

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    },

    /**
     * Toggle voice recognition
     */
    toggleVoice: function() {
      if (this.isRecording) {
        this.recognition.stop();
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'fr-FR'; // Default to French based on context
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        const btn = document.getElementById('easytech-voice-button');
        btn.classList.add('listening');
        document.getElementById('easytech-message-input').placeholder = "Listening...";
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        const btn = document.getElementById('easytech-voice-button');
        btn.classList.remove('listening');
        document.getElementById('easytech-message-input').placeholder = "Type your message...";
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('easytech-message-input');
        input.value = transcript;
        input.focus();
        // Optional: Auto-send
        // this.sendMessage();
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        this.recognition.stop();
      };

      this.recognition.start();
    },

    /**
     * Toggle chat window
     */
    toggleChat: function() {
      this.isOpen ? this.close() : this.open();
    },

    /**
     * Open chat window
     */
    open: function() {
      this.isOpen = true;
      document.getElementById('easytech-chat-window').style.display = 'flex';
      document.querySelector('.easytech-icon-chat').style.display = 'none';
      document.querySelector('.easytech-icon-close').style.display = 'block';
      document.getElementById('easytech-message-input').focus();
    },

    /**
     * Close chat window
     */
    close: function() {
      this.isOpen = false;
      document.getElementById('easytech-chat-window').style.display = 'none';
      document.querySelector('.easytech-icon-chat').style.display = 'block';
      document.querySelector('.easytech-icon-close').style.display = 'none';
    },

    /**
     * Send message
     */
    sendMessage: function() {
      const input = document.getElementById('easytech-message-input');
      const message = input.value.trim();
      
      if (!message) return;

      // Add user message to UI
      this.addMessage('user', message);
      input.value = '';

      // Send to backend
      this.sendToBackend(message);
    },

    /**
     * Add message to UI
     */
    addMessage: function(role, content) {
      const messagesContainer = document.getElementById('easytech-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `easytech-message easytech-message-${role}`;
      messageDiv.textContent = content;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    /**
     * Send message to backend
     */
    sendToBackend: async function(message) {
      try {
        const metadata = {
          page_url: window.location.href,
          website_domain: window.location.hostname,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          widget_version: '1.0.0'
        };

        const response = await fetch(`${this.config.apiUrl}/api/widget/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            message: message,
            metadata: metadata
          })
        });

        const data = await response.json();

        if (data.success && data.response) {
          this.addMessage('model', data.response);
        } else {
          this.addMessage('model', 'Sorry, I encountered an error. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        this.addMessage('model', 'Sorry, I could not connect to the server.');
      }
    },

    /**
     * Load chat history
     */
    loadHistory: async function() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/widget/history/${this.sessionId}`);
        const data = await response.json();

        if (data.success && data.messages) {
          data.messages.forEach(msg => {
            this.addMessage(msg.role, msg.content);
          });
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  };
})();
