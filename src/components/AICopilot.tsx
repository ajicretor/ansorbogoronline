import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, MessageSquare, Send, X, Sparkles, HelpCircle, 
  Terminal, ShieldCheck, Moon, Sun, ArrowUpRight, Copy, Check
} from "lucide-react";
import { useCMS } from "../context/CMSContext";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  isFallback?: boolean;
}

const PRESET_QUESTIONS = [
  { text: "Bagaimana cara masuk CMS?", q: "Bagaimana cara masuk ke CMS Portal dan apa username/password bawaannya?" },
  { text: "Hak Akses Sekretariat", q: "Apa saja batasan hak akses untuk peran Sekretariat?" },
  { text: "Cara membuat Berita", q: "Bagaimana cara menambahkan berita or berita dakwah baru di CMS?" },
  { text: "Tentang Mode Gelap", q: "Bagaimana cara mengaktifkan Mode Gelap (Dark Mode) di landing page dan CMS?" }
];

export default function AICopilot() {
  const { theme, toggleTheme } = useCMS();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from session or set default
  useEffect(() => {
    const saved = sessionStorage.getItem("ansor_copilot_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeDefault();
      }
    } else {
      initializeDefault();
    }
  }, []);

  const initializeDefault = () => {
    const defaultMsg: Message = {
      id: "welcome",
      role: "model",
      content: "Assalamu'alaikum wr. wb. Sahabat! Korps asisten pintar **Copilot AI Ansor** siap memandu Anda.\n\nSaya bertugas sebagai **CS Digital** untuk menjawab segala pertanyaan Anda mengenai cara penggunaan *Digital Suite & CMS Control Panel* ini.\n\nButuh bantuan apa hari ini? Silakan klik salah satu topik cepat di bawah atau tulis langsung pertanyaan Anda!"
    };
    setMessages([defaultMsg]);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const saveHistory = (msgs: Message[]) => {
    sessionStorage.setItem("ansor_copilot_chat", JSON.stringify(msgs));
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    saveHistory(updatedMessages);

    try {
      // Map state history to endpoint expected schema
      const cleanedHistory = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: cleanedHistory })
      });

      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }

      const data = await res.json();
      const modelMsg: Message = {
        id: `model-${Date.now()}`,
        role: "model",
        content: data.text || "Mohon maaf Sahabat, asisten AI sedang mengalami sedikit kendala jaringan. Silakan ulangi sesaat lagi."
      };

      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err) {
      console.error("AI Copilot request failed:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "model",
        content: "Astagfirullah, tampaknya terjadi kendala koneksi server. Pastikan server lokal Anda aktif sehat dan coba lagi ya Sahabat!"
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (qText: string) => {
    handleSendMessage(qText);
  };

  const clearChat = () => {
    if (window.confirm("Apakah Sahabat ingin menghapus riwayat obrolan asisten?")) {
      sessionStorage.removeItem("ansor_copilot_chat");
      initializeDefault();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper function to convert markdown *bold* and _italic_ to JSX
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check for bullet points
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const content = isBullet ? line.trim().substring(2) : line;

      // Handle simple markdown mapping
      let parsed = content;
      // Bold **text**
      parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-emerald-400">$1</strong>');
      // Italic *text* or _text_
      parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic text-emerald-200/90">$1</em>');
      parsed = parsed.replace(/_(.*?)_/g, '<em class="italic text-emerald-200/90">$1</em>');
      // Inline Code `text`
      parsed = parsed.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-emerald-950/80 text-amber-300 font-mono text-[11px] border border-emerald-800/30 font-bold">$1</code>');

      const element = <span dangerouslySetInnerHTML={{ __html: parsed }} />;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed mb-1 pr-1">
            {element}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed mb-2.5 last:mb-0 pr-1">
          {element}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans pointer-events-none select-none">
      
      {/* CHAT CONTAINER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className={`pointer-events-auto w-[90vw] sm:w-[380px] h-[520px] rounded-2xl shadow-[0_15px_50px_rgba(2,130,67,0.15)] flex flex-col overflow-hidden border mb-4 absolute bottom-18 right-0 ${
              theme === "dark"
                ? "bg-[#010f04] border-emerald-800/60 shadow-[0_20px_60px_rgba(1,10,4,0.9)]"
                : "bg-white border-emerald-100 shadow-[0_12px_44px_rgba(16,185,129,0.1)]"
            }`}
          >
            {/* PANEL HEADER */}
            <div className={`p-4 flex items-center justify-between border-b transition-colors duration-300 ${
              theme === "dark" 
                ? "bg-gradient-to-r from-[#011a08] to-[#010e05] border-emerald-800/40" 
                : "bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-100"
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 rounded-full border-white dark:border-[#010f04]" />
                </div>
                
                <div className="text-left">
                  <h3 className={`text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 ${
                    theme === "dark" ? "text-white" : "text-emerald-950"
                  }`}>
                    Copilot AI Ansor
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-mono">
                    CS Digital • Siap Membantu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Switch theme directly within widget if wanted, or clear chat */}
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  title="Bersihkan Chat"
                >
                  <Terminal className="w-3.5 h-3.5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                    theme === "dark" 
                      ? "border-emerald-800/50 hover:border-emerald-600 text-emerald-400 bg-emerald-950/20" 
                      : "border-slate-100 hover:bg-slate-100 text-slate-500"
                  }`}
                  aria-label="Tutup asisten"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CHAT BUBBLES AREA */}
            <div className={`flex-grow p-4 overflow-y-auto space-y-4 ${
              theme === "dark" ? "bg-[#010a04]" : "bg-slate-50/50"
            }`}>
              
              <div className="text-center pb-2 border-b border-dashed border-slate-200/60 dark:border-emerald-900/40">
                <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                  theme === "dark" 
                    ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/30" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}>
                  Asisten Penggunaan CMS & Web
                </span>
                <p className="text-[9px] text-slate-400 dark:text-emerald-500/60 mt-1.5 font-mono">
                  Solusi digital kaderisasi PC GP Ansor Bogor
                </p>
              </div>

              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2.5 ${isUser ? "justify-end text-right" : "justify-start text-left"}`}
                  >
                    {!isUser && (
                      <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 self-start mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    )}
                    
                    <div className={`max-w-[82%] relative group ${isUser ? "order-1" : "order-2"}`}>
                      <div className={`p-3 rounded-2xl text-xs shadow-xs tracking-wide transition-all ${
                        isUser
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium text-left"
                          : theme === "dark"
                            ? "bg-[#011406] border border-emerald-800/40 text-emerald-100/90 rounded-tl-none font-light"
                            : "bg-white border border-emerald-100/80 text-emerald-950 rounded-tl-none font-normal"
                      }`}>
                        {isUser ? (
                          <p className="text-xs leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderMessageContent(message.content)}
                          </div>
                        )}
                      </div>

                      {/* Utility Action copy for bot message */}
                      {!isUser && (
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 rounded bg-slate-150/80 dark:bg-emerald-950 hover:scale-105 active:scale-95 transition-all text-slate-500 hover:text-slate-700 dark:text-emerald-400/80 cursor-pointer"
                            title="Salin Pesan"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bot typing loader state */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start text-left">
                  <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 self-start mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                  </div>
                  
                  <div className="max-w-[75%]">
                    <div className={`p-3.5 rounded-2xl shadow-xs rounded-tl-none ${
                      theme === "dark" ? "bg-[#011406] border border-emerald-800/30" : "bg-white border border-emerald-100/60"
                    }`}>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PRESETS AND QUICK INPUT FIELD */}
            <div className={`p-3.5 border-t ${
              theme === "dark" ? "border-emerald-800/40 bg-[#011205]" : "border-emerald-100 bg-emerald-50/20"
            }`}>
              
              {/* Suggestion pills */}
              {messages.length <= 1 && !isLoading && (
                <div className="mb-3 space-y-1.5">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-emerald-500/60 text-left font-mono mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3 h-3" /> Rekomendasi Pertanyaan:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_QUESTIONS.map((pq, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetClick(pq.q)}
                        className={`text-[9.5px] p-2 text-left rounded-xl transition-all border font-semibold flex items-center justify-between hover:scale-102 active:scale-95 cursor-pointer ${
                          theme === "dark" 
                            ? "bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-950/80 text-emerald-400" 
                            : "bg-white border-emerald-50/70 hover:bg-emerald-50/30 hover:border-emerald-200/50 text-emerald-800 shadow-2xs"
                        }`}
                      >
                        <span className="truncate mr-1">{pq.text}</span>
                        <ArrowUpRight className="w-2.5 h-2.5/20 opacity-60 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat form field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik pertanyaan Sahabat..."
                  disabled={isLoading}
                  className={`flex-grow px-3 py-2 rounded-xl text-xs transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-9 border ${
                    theme === "dark" 
                      ? "bg-emerald-955/60 border-emerald-800/40 text-emerald-100 placeholder-emerald-600/70" 
                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                  }`}
                />
                
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    !inputValue.trim() || isLoading
                      ? "bg-emerald-500/10 text-slate-400 cursor-not-allowed border border-emerald-500/10 dark:border-transparent"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95 shadow-emerald-600/20"
                  }`}
                  aria-label="Kirim pesan"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT ACTION BUTTON (FAB) LOGO TRIGGER */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-600 to-teal-600 border-2 border-emerald-400 hover:border-yellow-400 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(2,130,67,0.4)] cursor-pointer relative z-40 transition-shadow focus:outline-none focus:ring-1 focus:ring-yellow-300 active:scale-95 animate-pulse-slow"
        title="Bantuan Copilot CS AI Ansor"
        aria-label="AI Partner Call Support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              <div className="relative">
                <Bot className="w-7 h-7 text-white" />
                {/* Embedded sparkles design for high value looks */}
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce-slow" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Soft active notification pulse */}
        {!isOpen && (
          <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </motion.button>

    </div>
  );
}
