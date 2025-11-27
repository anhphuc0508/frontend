// File: src/components/Chatbot.tsx

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { allProducts, supplementArticles, nutritionArticles } from '../constants';

// 👇 Dán API Key của bạn vào đây
const API_KEY = "AIzaSyC4NOuoO0_vpZ43Eki01vbG8KOs_oZYAX0"; 

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Xin chào! 👋 Tôi là trợ lý AI của GymSup. Tôi có thể giúp gì cho bạn hôm nay?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // === CẤU HÌNH AI ===
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const SYSTEM_PROMPT = `
    Bạn là nhân viên tư vấn bán hàng chuyên nghiệp, thân thiện của "GymSup".
    
    Dữ liệu sản phẩm:
    ${JSON.stringify(allProducts.map(p => ({ name: p.name, price: p.price, desc: p.description })))}

    Dữ liệu bài viết:
    ${JSON.stringify([...supplementArticles, ...nutritionArticles].map(a => ({ title: a.title, snippet: a.snippet })))}

    Quy tắc:
    1. Chỉ tư vấn sản phẩm/kiến thức trong danh sách.
    2. Văn phong trẻ trung, dùng emoji hợp lý.
    3. Luôn gợi ý khách mua hàng nếu thấy phù hợp.
    4. Tiền tệ: VNĐ.
  `;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `${SYSTEM_PROMPT}\nKhách hàng hỏi: "${userMsg.text}"\nTrả lời:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      setMessages(prev => [...prev, { id: Date.now() + 1, text: text, sender: 'bot' }]);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Xin lỗi, server đang quá tải. Bạn thử lại sau nhé! 😓", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* --- CỬA SỔ CHAT --- */}
      <div 
        className={`
          transition-all duration-300 ease-in-out transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
          w-[360px] h-[550px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 
          rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
               {/* Icon Bot */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-600">
                  <path d="M16.5 7.5h-9v9h9v-9z" opacity=".3"/>
                  <path d="M20 9V7c0-1.103-.897-2-2-2h-3.25c.094-.644.25-1.921.25-2.5 0-1.379-1.121-2.5-2.5-2.5S10 1.121 10 2.5c0 .579.156 1.856.25 2.5H7c-1.103 0-2 .897-2 2v2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1zm-1.5 7.5h-13v-9h13v9zm-11-2v2h2v-2h-2zm9 0v2h2v-2h-2zm-4-4v4h-2v-4h2z"/>
               </svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">GymSup AI</h3>
              <p className="text-yellow-100 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Đang hoạt động
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Body Chat */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-900 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          <div className="text-center text-xs text-zinc-500 my-2">Hôm nay {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
              {/* Bot Avatar (chỉ hiện khi bot chat) */}
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/30">
                   <span className="text-xs">🤖</span>
                </div>
              )}

              {/* Message Bubble */}
              <div 
                className={`
                  max-w-[75%] p-3 text-sm shadow-sm relative
                  ${msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-2xl rounded-tl-sm'
                  }
                `}
              >
                {msg.text}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 border border-zinc-600">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-400">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                   </svg>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
               <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                   <span className="text-xs">🤖</span>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-2 bg-zinc-800 p-1.5 rounded-full border border-zinc-700 focus-within:border-yellow-500/50 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi GymSup ngay..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white text-sm px-4 py-2 focus:outline-none placeholder-zinc-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`
                p-2.5 rounded-full text-white transition-all transform
                ${isLoading || !input.trim() 
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                  : 'bg-yellow-500 text-zinc-900 hover:bg-yellow-400 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-zinc-600">Được hỗ trợ bởi Gemini AI</p>
          </div>
        </div>
      </div>

      {/* --- NÚT TRÒN MỞ CHAT --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center justify-center w-16 h-16 
          rounded-full shadow-2xl transition-all duration-300 z-50
          ${isOpen ? 'bg-zinc-800 rotate-90' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-110 hover:shadow-yellow-500/40'}
        `}
      >
        {/* Ping effect khi đóng */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-zinc-900"></span>
          </span>
        )}

        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-zinc-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
           </svg>
        )}
      </button>
    </div>
  );
};

export default Chatbot;