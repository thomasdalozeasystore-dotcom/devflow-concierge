import React from 'react';
import { ChatMessage, Role } from '../types';

interface Props {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-sm ${
          isUser 
            ? 'bg-brand-600 text-white rounded-br-none' 
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        <div className={`text-[10px] mt-1 opacity-70 ${isUser ? 'text-brand-100' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};