import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your enrollment assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Simple rule-based responses (In production, integrate with AI API)
    if (message.includes('enroll') || message.includes('enrollment')) {
      return 'To enroll in courses, go to the Enrollment page from the sidebar. You can browse available courses and submit your enrollment request there.';
    } else if (message.includes('course') || message.includes('subject')) {
      return 'You can view all available courses in the Courses section. Each course shows the instructor, schedule, and available slots.';
    } else if (message.includes('schedule')) {
      return 'Course schedules are displayed in the Courses page. You can filter by day and time to find courses that fit your schedule.';
    } else if (message.includes('grade') || message.includes('report')) {
      return 'Check the Reports section to view your grades and academic progress.';
    } else if (message.includes('help') || message.includes('support')) {
      return 'I can help you with enrollment, courses, schedules, and general navigation. What would you like to know?';
    } else if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! How can I assist you with your enrollment today?';
    } else {
      return 'I\'m here to help! You can ask me about enrollment, courses, schedules, or reports. What would you like to know?';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(input),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">
        <Bot size={20} />
        <span>Enrollment Assistant</span>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-icon">
              {message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="message-content">
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="message-icon">
              <Bot size={16} />
            </div>
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
        />
        <button onClick={handleSend} disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
