/**
 * ChatScreen Component
 * AI-powered chat for incident reporting with voice support
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, FileText, Loader2, Mic, MicOff, Image, Bot, User, Square } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ChatMessage, EvidenceFile } from '../types/index.js';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

interface ChatScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onFileUpload: (files: FileList) => void;
  isAnalyzing: boolean;
}

export default function ChatScreen({
  onNavigate,
  onBack,
  messages,
  onSendMessage,
  onFileUpload,
  isAnalyzing,
}: ChatScreenProps) {
  const { t, theme } = useApp();
  const [input, setInput] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Support Indian English
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          try {
            recognitionRef.current.start();
          } catch (e) {
            stopRecording();
          }
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice recording is not supported in your browser. Please use Chrome.');
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!input.trim() || isAnalyzing) return;
    stopRecording();
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header showBack onBack={onBack} />

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-48 relative">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`mb-4 flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Avatar for assistant */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'chat-bubble-user text-white'
                    : 'chat-bubble-assistant bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                } ${msg.italic ? 'italic text-sm opacity-80' : ''}`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden border border-white/20"
                      >
                        {file.mimetype.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Avatar for user */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ml-2 flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing/Analyzing Indicator */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
              <div className="typing-indicator flex items-center gap-1.5">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto">
          {/* Recording indicator */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Recording voice...</span>
                  <span className="text-red-500 font-mono">{formatTime(recordingTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`chat-input-container flex items-end gap-2 p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 transition-all duration-300 ${
              isFocused ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
            />

            {/* Attachment buttons */}
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles || isAnalyzing}
                className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Attach file"
              >
                {uploadingFiles ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                ) : (
                  <Paperclip className="w-5 h-5 text-gray-500" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Add image"
              >
                <Image className="w-5 h-5 text-gray-500" />
              </motion.button>

              {/* Voice Recording Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`p-2.5 rounded-xl transition-all disabled:opacity-50 ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-500" />
                )}
              </motion.button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isRecording ? 'Listening... Speak now' : t('chat.placeholder')}
              className="flex-1 px-4 py-3 rounded-xl bg-transparent resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[48px] max-h-[150px]"
              disabled={isAnalyzing}
              rows={1}
            />

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!input.trim() || isAnalyzing}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Helper text */}
          <div className="flex items-center justify-between mt-2 px-2">
            <p className="text-xs text-gray-400">
              {t('chat.secure')}
            </p>
            <p className="text-xs text-gray-400">
              🎤 Voice or ⌨️ Type
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
