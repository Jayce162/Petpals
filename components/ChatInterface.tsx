import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Image as ImageIcon, Smile, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { PetProfile } from '../types';
import { AIChatHelper } from './AIChatHelper';
import { PLACEHOLDER_AVATAR, PLACEHOLDER_IMAGE } from '../constants';
import { generateChatReply } from '../services/geminiService';

interface ChatInterfaceProps {
  myPet: PetProfile;
  chatPartner: PetProfile;
  onBack: () => void;
  initialMessage?: string;
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  timestamp: Date;
  status?: 'sent' | 'read';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ myPet, chatPartner, onBack, initialMessage }) => {
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: chatPartner.id,
      text: `Hey! ${myPet.name} is so cute. What breed is he?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'read'
    },
    {
      id: '2',
      senderId: 'me',
      text: `Thanks! He's a ${myPet.breed}. He's a little rascal but we love him. Your ${chatPartner.breed} looks so majestic!`,
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      status: 'read'
    },
    {
      id: '3',
      senderId: chatPartner.id,
      text: "Haha, majestic is one word for it! He's mostly just a big goofball. Look at this picture from the park today.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'read'
    },
    {
      id: '4',
      senderId: chatPartner.id,
      image: chatPartner.images[1] || chatPartner.images[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 29),
      status: 'read'
    },
    {
      id: '5',
      senderId: 'me',
      text: "Aww, what a happy pup! 😍 We should definitely meet up sometime.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'read'
    }
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping && isMounted.current) {
      inputRef.current?.focus();
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const text = inputValue.trim();
    if (!text) return;
    
    const userMsgId = Date.now().toString();
    const newMessage: Message = {
      id: userMsgId,
      senderId: 'me',
      text: text,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const historyContext = messages.map(m => ({
        sender: m.senderId === 'me' ? 'me' as const : 'them' as const,
        text: m.text || '[Image Sent]'
      }));

      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      if (!isMounted.current) return;

      const aiResponseText = await generateChatReply(myPet, chatPartner, text, historyContext);

      if (!isMounted.current) return;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: chatPartner.id,
        text: aiResponseText,
        timestamp: new Date(),
        status: 'read'
      };

      setMessages(prev => 
        prev.map(m => m.id === userMsgId ? { ...m, status: 'read' as const } : m)
            .concat(aiMessage)
      );

    } catch (error) {
      console.error("Failed to get AI reply", error);
    } finally {
      if (isMounted.current) {
        setIsTyping(false);
      }
    }
  };

  const handleAISelect = (msg: string) => {
    setInputValue(msg);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] fixed inset-0 z-50 animate-in slide-in-from-right duration-300">
      
      {/* Header - Glassy & Taller */}
      <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-gray-100 pt-12 pb-3 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-gray-700 active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="relative group cursor-pointer">
              <img 
                src={chatPartner.images[0]} 
                alt={chatPartner.name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[2px] border-white rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-gray-900 text-base leading-tight flex items-center gap-1">
                {chatPartner.name}
                <span className="text-gray-400 font-normal text-xs">& {chatPartner.ownerName}</span>
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          
          <button className="p-2 text-gray-400 hover:bg-white/50 hover:text-gray-700 rounded-full transition-colors active:scale-95">
            <MoreVertical size={22} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 bg-[#f8f9fa] scroll-smooth touch-pan-y">
        
        {/* Date Separator */}
        <div className="flex justify-center my-6">
          <span className="bg-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {/* AI Helper - Inline Collapsible feel */}
        <div className="mb-6 mx-2">
             <AIChatHelper 
                myPet={myPet} 
                theirPet={chatPartner} 
                onSelectMessage={handleAISelect} 
             />
        </div>

        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === 'me';
            const isNextFromSender = messages[index + 1]?.senderId === msg.senderId;
            
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar (Partner Only) */}
                  <div className="w-6 flex-shrink-0">
                    {!isMe && !isNextFromSender ? (
                      <img 
                        src={chatPartner.images[0]} 
                        alt="Avatar" 
                        className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                      />
                    ) : (
                      <div className="w-6" />
                    )}
                  </div>

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 min-w-0`}>
                    
                    {/* Message Bubble */}
                    {msg.image ? (
                      <div className="rounded-[20px] overflow-hidden border border-gray-100 shadow-sm mb-1 transform transition-transform hover:scale-[1.02]">
                        <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="w-full max-w-[240px] object-cover" 
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
                        />
                      </div>
                    ) : (
                      <div 
                        className={`
                          px-4 py-2.5 text-[15px] leading-relaxed shadow-sm relative max-w-full break-words
                          ${isMe 
                            ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-[20px] rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-[20px] rounded-tl-none'
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Meta Data */}
                    {!isNextFromSender && (
                        <div className={`flex items-center gap-1 text-[10px] font-medium text-gray-400 opacity-80 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && (
                            <span className="ml-0.5">
                            {msg.status === 'read' ? <CheckCheck size={12} className="text-coral-500" /> : <Check size={12} />}
                            </span>
                        )}
                        </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
                <div className="flex flex-row items-end gap-2">
                    <div className="w-6 flex-shrink-0">
                        <img 
                            src={chatPartner.images[0]} 
                            alt="Avatar" 
                            className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                        />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-[20px] rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="flex-none px-4 pb-6 pt-2 z-30 pointer-events-none">
        <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 max-w-screen-lg mx-auto pointer-events-auto"
        >
          <div className="flex-1 relative bg-white rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center p-1 transition-all focus-within:shadow-[0_8px_30px_rgba(247,165,165,0.15)] focus-within:border-coral-100">
            <button type="button" className="p-2.5 text-gray-400 hover:text-coral-500 hover:bg-gray-50 rounded-full transition-all active:scale-90">
                <ImageIcon size={22} />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isTyping}
              className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 px-2 py-3 focus:outline-none text-[16px] disabled:opacity-60 min-w-0"
            />
            
            <button type="button" className="p-2.5 text-gray-400 hover:text-coral-500 hover:bg-gray-50 rounded-full transition-all active:scale-90">
              <Smile size={22} />
            </button>
          </div>

          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`
                rounded-full shadow-lg transition-all flex-shrink-0 flex items-center justify-center w-[54px] h-[54px]
                ${!inputValue.trim() || isTyping 
                    ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed' 
                    : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-coral-200 hover:shadow-coral-300 hover:scale-105 active:scale-95'
                }
            `}
          >
            {isTyping ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} className={inputValue.trim() ? 'ml-0.5' : ''} />}
          </button>
        </form>
      </div>
    </div>
  );
};