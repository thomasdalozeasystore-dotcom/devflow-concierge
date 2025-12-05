import React from 'react';
import { Button } from './Button';

interface Props {
  isConnected: boolean;
  isSpeaking: boolean; // Bot is speaking
  onStart: () => void;
  onEnd: () => void;
  isLoading?: boolean;
}

export const VoiceControls: React.FC<Props> = ({ isConnected, isSpeaking, onStart, onEnd, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-slate-50 border-t border-slate-200">
      
      {/* Status Indicator */}
      <div className="h-12 flex items-center justify-center">
        {isConnected ? (
          <div className="flex items-center gap-3">
             {isSpeaking ? (
                <div className="flex gap-1 items-center">
                  <div className="w-2 bg-brand-500 animate-[bounce_1s_infinite] h-4"></div>
                  <div className="w-2 bg-brand-500 animate-[bounce_1s_infinite_0.1s] h-6"></div>
                  <div className="w-2 bg-brand-500 animate-[bounce_1s_infinite_0.2s] h-4"></div>
                  <span className="ml-2 text-brand-600 font-medium">DevFlow Bot Speaking...</span>
                </div>
             ) : (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-slate-600 font-medium">Listening to you...</span>
                </div>
             )}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">Tap microphone to start talking</div>
        )}
      </div>

      {/* Main Control */}
      <div className="flex items-center gap-4">
        {!isConnected ? (
          <button
            onClick={onStart}
            disabled={isLoading}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-brand-600 hover:bg-brand-500 shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
          </button>
        ) : (
          <button
            onClick={onEnd}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl transition-all hover:scale-105"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path fillRule="evenodd" d="M15.22 6.268l-1.43-1.43a.75.75 0 00-1.06 0l-6.22 6.22a.75.75 0 000 1.06l1.43 1.43a.75.75 0 101.06-1.06l-6.22-6.22a.75.75 0 00-1.06 0l-1.43 1.43a.75.75 0 000 1.06l6.22 6.22a.75.75 0 001.06 0l1.43-1.43a.75.75 0 000-1.06l-6.22-6.22a.75.75 0 00-1.06 0z" clipRule="evenodd" />
                <path d="M13.5 13.5L12 12m0 0l-1.5-1.5M12 12l1.5-1.5M12 12l-1.5 1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" stroke="currentColor" fill="none" />
              </svg>
          </button>
        )}
      </div>
      
      <div className="text-center">
        <p className="font-medium text-slate-700">
            {isConnected ? "Conversation Active" : "Start Voice Call"}
        </p>
        <p className="text-sm text-slate-500 mt-1">
            {isConnected ? "Speak naturally to the AI assistant" : "Tap the microphone to begin"}
        </p>
      </div>
    </div>
  );
};