
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
    <div className="flex flex-col h-full bg-[#F8F9FA] fixed inset-0 z-50 animate-in slide-in-from-right duration-300">
      
      {/* Header - Taller with better safe area */}
      <div className="flex-none bg-white/90 backdrop-blur-xl border-b border-gray-100 pt-12 pb-4 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2.5 -ml-3 hover:bg-gray-100 rounded-full transition-colors text-gray-700 active:scale-95"
            >
              <ArrowLeft size={26} />
            </button>
            
            <div className="relative group cursor-pointer">
              <img 
                src={chatPartner.images[0]} 
                alt={chatPartner.name} 
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" 
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-white rounded-full shadow-sm"></div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-gray-900 text-[17px] leading-tight">
                {chatPartner.ownerName} & {chatPartner.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
          
          <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors active:scale-95">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 bg-[#F8F9FA] scroll-smooth touch-pan-y">
        
        {/* Date Separator */}
        <div className="flex justify-center my-8">
          <span className="bg-gray-200/70 text-gray-500 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm">
            Today
          </span>
        </div>

        {/* AI Helper */}
        <div className="mb-8 px-1">
             <AIChatHelper 
                myPet={myPet} 
                theirPet={chatPartner} 
                onSelectMessage={handleAISelect} 
             />
        </div>

        <div className="space-y-5">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === 'me';
            const isNextFromSender = messages[index + 1]?.senderId === msg.senderId;
            
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  
                  {/* Avatar (Partner Only) */}
                  <div className="w-8 flex-shrink-0">
                    {!isMe && !isNextFromSender ? (
                      <img 
                        src={chatPartner.images[0]} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                      />
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                    
                    {/* Message Bubble */}
                    {msg.image ? (
                      <div className="rounded-[24px] overflow-hidden border border-gray-100 shadow-md mb-1">
                        <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="w-full max-w-[260px] object-cover" 
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
                        />
                      </div>
                    ) : (
                      <div 
                        className={`
                          px-5 py-3 text-[15px] leading-relaxed shadow-sm relative max-w-full break-words transition-all
                          ${isMe 
                            ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-[22px] rounded-tr-sm hover:shadow-md' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-[22px] rounded-tl-sm hover:shadow-md'
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Meta Data */}
                    {!isNextFromSender && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium text-gray-400 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && (
                            <span className="ml-0.5">
                            {msg.status === 'read' ? <CheckCheck size={13} className="text-coral-500" /> : <Check size={13} />}
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
             <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 mt-4">
                <div className="flex flex-row items-end gap-3">
                    <div className="w-8 flex-shrink-0">
                        <img 
                            src={chatPartner.images[0]} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                        />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[22px] rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-sm">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white border-t border-gray-100 px-4 py-4 pb-8 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-3 max-w-screen-lg mx-auto"
        >
          <button type="button" className="p-3.5 text-gray-400 bg-gray-50 hover:bg-coral-50 hover:text-coral-500 rounded-full transition-all flex-shrink-0 active:scale-95">
            <ImageIcon size={24} />
          </button>
          
          <div className="flex-1 relative bg-gray-50 rounded-[28px] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-coral-100 focus-within:shadow-md border border-transparent focus-within:border-coral-100">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isTyping}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 pl-6 pr-12 py-4 focus:outline-none text-[16px] disabled:opacity-60"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-coral-500 p-1.5 active:scale-90 transition-transform hover:bg-gray-100 rounded-full">
              <Smile size={24} />
            </button>
          </div>

          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`
                p-4 rounded-full shadow-lg transition-all flex-shrink-0 flex items-center justify-center w-[56px] h-[56px]
                ${!inputValue.trim() || isTyping 
                    ? 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed' 
                    : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-coral-200 hover:shadow-coral-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                }
            `}
          >
            {isTyping ? <Loader2 size={24} className="animate-spin text-gray-400" /> : <Send size={24} className={inputValue.trim() ? 'ml-0.5' : ''} />}
          </button>
        </form>
      </div>
    </div>
  );
};
