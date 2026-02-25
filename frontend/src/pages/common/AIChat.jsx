import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIChat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your QueueEase assistant. How can I help you today? You can ask me about wait times, department locations, or how to use the app.", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            let botResponse = "I'm sorry, I'm still learning. Can you please rephrase that?";
            const msg = userMessage.text.toLowerCase();

            if (msg.includes('wait')) botResponse = "The average wait time is currently about 20 minutes across all departments. Cardiology is particularly busy today.";
            else if (msg.includes('cardiology')) botResponse = "Cardiology is located on the 2nd floor, Room 204.";
            else if (msg.includes('hello') || msg.includes('hi')) botResponse = "Hello! How can I assist you with your hospital visit today?";
            else if (msg.includes('token')) botResponse = "You can generate a token from your dashboard by selecting a department.";

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                                QueueEase Assistant
                                <Sparkles className="w-3 h-3 text-accent fill-accent" />
                            </div>
                            <div className="text-xs text-emerald-500 font-bold uppercase tracking-tighter">AI Powered</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                            {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`p-4 rounded-2xl leading-relaxed ${msg.sender === 'user'
                                ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-4 max-w-2xl">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-5 h-5 text-primary animate-bounce" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex items-center gap-1 border border-slate-100">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-6 border-t border-slate-100 bg-slate-50/50">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="max-w-4xl mx-auto flex gap-4"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 font-medium"
                        placeholder="Type your question here..."
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-4 bg-primary text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default AIChat;
