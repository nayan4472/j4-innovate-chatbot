import React, { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- THEME & STYLES ---
const THEME = {
  bg: "#0b141a",
  cardBg: "#0b141a",
  glass: "rgba(255, 255, 255, 0.03)",
  accent: "#10b981", 
  accentGlow: "rgba(16, 185, 129, 0.3)",
  userBubble: "#005c4b",
  botBubble: "#202c33",
  text: "#e9edef",
  textMuted: "#8696a0",
  border: "rgba(255, 255, 255, 0.1)",
};

const STYLES = {
  container: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: THEME.bg,
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    color: THEME.text,
    margin: 0,
    padding: 0,
    position: "fixed",
    top: 0,
    left: 0,
  },
  phoneFrame: {
    width: "100%",
    maxWidth: "400px",
    height: "85vh",
    maxHeight: "750px",
    backgroundColor: THEME.cardBg,
    backdropFilter: "blur(40px)",
    borderRadius: "40px",
    border: `1px solid ${THEME.border}`,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.8)",
    position: "relative",
    zIndex: 10,
  },
  header: {
    padding: "24px",
    borderBottom: `1px solid ${THEME.border}`,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(255,255,255,0.02)",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    backgroundColor: THEME.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "20px",
    color: "#fff",
    boxShadow: `0 8px 20px ${THEME.accentGlow}`,
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    scrollbarWidth: "none",
  },
  inputArea: {
    padding: "20px 24px",
    background: "transparent",
    borderTop: `1px solid ${THEME.border}`,
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "20px",
    padding: "8px",
    border: `1px solid ${THEME.border}`,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: THEME.text,
    padding: "12px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "none",
    height: "44px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    backgroundColor: THEME.accent,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// --- LOGIC ---
const PORTFOLIO = [
  { title: "E-Commerce App", img: "https://images.unsplash.com/photo-1512428559083-a4979baf3830?w=400", desc: "A premium shopping experience." },
  { title: "AI Real Estate Bot", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400", desc: "Automating property queries." },
  { title: "Brand Identity", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400", desc: "Modern social media branding." }
];

const STATES = {
  IDLE: "IDLE",
  WAITING_FOR_SERVICE: "WAITING_FOR_SERVICE",
  CONFIRM_PROCEED: "CONFIRM_PROCEED",
  COLLECTING_INFO: "COLLECTING_INFO",
  COLLECTING_CONTACT: "COLLECTING_CONTACT",
  SCHEDULING_DATE: "SCHEDULING_DATE",
  SCHEDULING_TIME: "SCHEDULING_TIME",
};

const SERVICES = {
  "1": "Website & App Development",
  "2": "Chatbot Services",
  "3": "Social Media Content",
};

const SERVICE_DETAILS = {
  "Website & App Development": "We create high-performance, responsive websites and mobile apps using cutting-edge technologies like React and Next.js. 📱✨",
  "Chatbot Services": "Our AI-powered chatbots can handle customer queries 24/7, automate sales, and integrate seamlessly with WhatsApp & Telegram. 🤖💬",
  "Social Media Content": "We craft viral-ready content strategies and stunning visuals to boost your brand's presence across Instagram, LinkedIn, and more. 🚀📈",
};

const SYSTEM_PROMPT = `You are J4_Innovate Chatbot, the official AI strategist for J4_Innovate.

### MULTI-LANGUAGE CAPABILITY:
- You MUST detect the user's language (Gujarati, Hindi, or English).
- Always reply in the SAME language the user uses.
- If the user talks in Gujarati, reply in Gujarati. If in Hindi, reply in Hindi.

### YOUR CORE TASK:
1. If user says "Hi" or "Hello", greet them with the exact menu:
   👋 Welcome to **J4_Innovate Chatbot**
   How can we help you today?
   1️⃣ **Website Development**
   2️⃣ **Chatbot Services**
   3️⃣ **Social Media Content**
   4️⃣ **Book a Meeting**

2. If they select a service, explain it briefly and ask if they want to proceed.
3. If they say "Yes", "હા", or "हाँ", ask for their "Name and Business Name".
4. Then ask for their "Contact details".
5. If they want to "Book a Meeting", guide them to select a date and time. J4_Innovate can help them.

Maintain a premium, energetic, and professional tone at all times. Use emojis.`;

async function getGeminiResponse(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Try 1.5 Flash first (faster/newer)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${SYSTEM_PROMPT}\nUser: ${userInput}\nBot:`);
    return result.response.text();
  } catch (err) {
    console.warn("Gemini 1.5 Flash failed, trying gemini-pro...", err);
    try {
      // Fallback to stable gemini-pro
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(`${SYSTEM_PROMPT}\nUser: ${userInput}\nBot:`);
      return result.response.text();
    } catch (err2) {
      console.error("All AI models failed", err2);
      throw err2;
    }
  }
}

const processInput = async (input, state, lead) => {
  const raw = input.toLowerCase().trim();
  
  if (raw === "hi" || raw === "hello" || raw === "start") {
    return {
      text: "👋 Welcome to **J4_Innovate Chatbot**\nHow can we help you today?\n\n1️⃣ **Website Development**\n2️⃣ **Chatbot Services**\n3️⃣ **Social Media Content**\n4️⃣ **Book a Meeting**",
      options: ["Website Development", "Chatbot Services", "Social Media Content", "Book a Meeting"],
      nextState: STATES.WAITING_FOR_SERVICE,
      lead: { service: "", name: "", contact: "" }
    };
  }

  switch(state) {
    case STATES.WAITING_FOR_SERVICE:
      if (raw.includes("meeting") || raw === "4") {
        return {
          text: "📅 **Schedule a Strategy Session**\n\nExcellent! Which **day** works best for you next week?",
          options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          nextState: STATES.SCHEDULING_DATE,
          lead
        };
      }
      const selected = SERVICES[raw] || Object.values(SERVICES).find(s => raw.includes(s.toLowerCase().split(' ')[0]));
      if (selected) {
        return {
          text: `⚡ **${selected}**\n\n${SERVICE_DETAILS[selected]}\n\nWould you like to proceed with a custom consultation?`,
          options: ["Yes, let's go!", "No, not now"],
          nextState: STATES.CONFIRM_PROCEED,
          lead: { ...lead, service: selected }
        };
      }
      break;

    case STATES.SCHEDULING_DATE:
      return {
        text: `Got it! **${input}** is perfect. What **time** would you like to connect? (e.g. 11:00 AM or 4:30 PM)`,
        options: ["10:00 AM", "2:00 PM", "5:00 PM"],
        nextState: STATES.SCHEDULING_TIME,
        lead: { ...lead, service: "Meeting: " + input }
      };

    case STATES.SCHEDULING_TIME:
      return {
        text: `Perfect! 📅 Meeting set for **${lead.service.split(': ')[1]} at ${input}**.\n\nTo finalize, please share your **Full Name** and **Business Name**.`,
        nextState: STATES.COLLECTING_INFO,
        lead: { ...lead, service: lead.service + " @ " + input }
      };

    case STATES.CONFIRM_PROCEED:
      if (raw.includes("yes") || raw.includes("go") || raw === "હા" || raw === "हां") return { text: "Excellent! To get started, please share your **Full Name** and **Business Name**.", nextState: STATES.COLLECTING_INFO, lead };
      return { text: "No worries! Type **Hi** to see our services again.", nextState: STATES.IDLE };

    case STATES.COLLECTING_INFO:
      return { text: `Nice to meet you, **${input}**! 👋\nFinal step: Please share your **WhatsApp Number** or **Email**.`, nextState: STATES.COLLECTING_CONTACT, lead: { ...lead, name: input } };

    case STATES.COLLECTING_CONTACT:
      const nameLines = lead.name.split(/[\n|]/).map(s => s.trim()).filter(Boolean);
      const contactLines = input.split(/[\n|]/).map(s => s.trim()).filter(Boolean);
      return {
        text: `🎊 **Done! Your details are saved.**\n\n👤 Name: ${nameLines[0]||"N/A"}\n🏢 Business: ${nameLines[1]||"N/A"}\n💼 Service: ${lead.service}\n📞 Phone: ${contactLines[0]||"N/A"}\n📧 Email: ${contactLines[1]||"N/A"}\n\nOur strategist will contact you soon!`,
        nextState: STATES.IDLE, lead: { ...lead, contact: input }, isFinal: true
      };
  }

  try {
    const aiText = await getGeminiResponse(input);
    return { text: aiText, nextState: state, lead };
  } catch (err) {
    return { 
      text: "I appreciate your query! 💡 However, J4_Innovate is a specialized **Digital Solutions Agency**. We focus exclusively on Web/App Development, AI Chatbots, and Social Media branding.\n\nSince this request is outside our technical expertise, I recommend exploring our growth services by typing **'Hi'**! 🚀", 
      nextState: state, 
      lead 
    };
  }
};

// --- MAIN COMPONENT ---

export default function J4InnovateBot() {
  const [messages, setMessages] = useState([]);
  const [val, setVal] = useState("");
  const [state, setState] = useState(STATES.IDLE);
  const [lead, setLead] = useState({ service: "", name: "", contact: "" });
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const addMsg = (sender, text, options = []) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender, text, time, options }]);
  };

  const handleSend = async (txt) => {
    const input = (txt || val).trim();
    if (!input) return;

    addMsg("user", input);
    setVal("");
    setTyping(true);

    const res = await processInput(input, state, lead);
    
    // Add a natural delay so the user can see the "Thinking..." state
    setTimeout(() => {
      addMsg("bot", res.text, res.options);
      setState(res.nextState);
      if (res.lead) setLead(res.lead);
      setTyping(false);

      if (res.isFinal) {
        const nameLines = res.lead.name.split(/[\n|]/).map(s => s.trim()).filter(Boolean);
        const contactLines = res.lead.contact.split(/[\n|]/).map(s => s.trim()).filter(Boolean);
        const newEntry = {
          name: nameLines[0] || "N/A",
          business: nameLines[1] || "N/A",
          service: res.lead.service,
          phone: contactLines[0] || "N/A",
          email: contactLines[1] || "N/A",
          date: new Date().toLocaleString(),
          id: Date.now()
        };
        const existing = JSON.parse(localStorage.getItem("j4_leads") || "[]");
        localStorage.setItem("j4_leads", JSON.stringify([newEntry, ...existing]));
      }
    }, 1500);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    setMessages([]);
    setState(STATES.IDLE);
  }, []);

  return (
    <div style={STYLES.container}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 0px; }
        .option-btn {
          margin-top: 12px;
          padding: 12px 20px;
          border-radius: 15px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
          width: 100%;
          max-width: 260px;
          font-family: inherit;
        }
        .option-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .hello-btn {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
          transition: all 0.2s;
          display: inline-block;
          font-family: inherit;
        }
        .hello-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }
        .whatsapp-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #0b141a;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          background-repeat: repeat;
          background-size: 400px;
          opacity: 0.08;
          z-index: 0;
          pointer-events: none;
        }
        .start-btn {
          padding: 14px 28px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: shimmer 2s infinite linear;
          background-size: 200% auto;
        }
        .start-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 15px 25px rgba(16, 185, 129, 0.4);
        }
        .pulse-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 140px; height: 140px;
          border-radius: 40px;
          background: rgba(16, 185, 129, 0.2);
          animation: pulse 2s infinite;
          z-index: 1;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .floating-icon {
          animation: floating 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
      `}</style>

      {/* Decorative background elements */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)", zIndex: 1 }} />

      <div style={STYLES.phoneFrame}>
        <div style={STYLES.header}>
          <img 
            src="https://media.licdn.com/dms/image/v2/D5603AQFGMbkvhTD54Q/profile-displayphoto-shrink_400_400/B56ZpVE2zbHQAg-/0/1762363929544?e=1778716800&v=beta&t=4oSNfpWJWFycjSMUBCV02ayToNM30tzTzTBgRF2eNDg" 
            style={{...STYLES.avatar, backgroundColor: "#fff", padding: "2px"}} 
            alt="Profile" 
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "17px", letterSpacing: "-0.4px" }}>J4_Innovate Chatbot</div>
            <div style={{ fontSize: "12px", color: THEME.accent, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: THEME.accent, boxShadow: `0 0 8px ${THEME.accent}` }} />
              Active Now
            </div>
          </div>
          <div 
            style={{ opacity: 0.5, cursor: "pointer" }} 
            onClick={() => { setMessages([]); setState(STATES.IDLE); setLead({ service: "", name: "", contact: "" }); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div className="whatsapp-bg"></div>
          <div style={{ ...STYLES.chatWindow, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} ref={scrollRef}>
            {messages.length === 0 ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
                {/* Floating Decorative Icons */}
                <div className="floating-icon" style={{ position: "absolute", top: "25%", left: "15%", fontSize: "24px", opacity: 0.2 }}>💻</div>
                <div className="floating-icon" style={{ position: "absolute", top: "20%", right: "20%", fontSize: "28px", opacity: 0.2, animationDelay: "1s" }}>🚀</div>
                <div className="floating-icon" style={{ position: "absolute", bottom: "35%", left: "20%", fontSize: "22px", opacity: 0.2, animationDelay: "2s" }}>📱</div>
                <div className="floating-icon" style={{ position: "absolute", bottom: "30%", right: "15%", fontSize: "26px", opacity: 0.2, animationDelay: "1.5s" }}>🤖</div>

                <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
                    J4_Innovate <span style={{ color: THEME.accent }}>Chatbot</span>
                  </h2>
                  <p style={{ fontSize: "14px", color: THEME.textMuted, maxWidth: "260px", lineHeight: "1.6" }}>
                    Your official AI strategist is ready! <br/>Type "Hi" or "Hello" to explore our services. 🚀
                  </p>
                </div>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start", animation: "fadeIn 0.3s ease-out forwards", position: "relative", marginBottom: "12px" }}>
                <div style={{ 
                  maxWidth: "85%", padding: "10px 14px 6px 14px", borderRadius: m.sender === "user" ? "12px 0px 12px 12px" : "0px 12px 12px 12px",
                  background: m.sender === "user" ? THEME.userBubble : THEME.botBubble,
                  color: THEME.text, border: m.sender === "user" ? "none" : `1px solid ${THEME.border}`,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  position: "relative",
                }}>
                  <div style={{ fontSize: "14.5px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: THEME.text, paddingRight: "10px" }}>
                    {m.text.split("**").map((p, j) => j % 2 ? (
                      <strong key={j} style={{ 
                        color: "#fff", 
                        fontWeight: "700", 
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        padding: "1px 4px",
                        borderRadius: "4px"
                      }}>{p}</strong>
                    ) : p)}
                  </div>

                  {m.showPortfolio && (
                    <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "10px 0", marginTop: "10px" }}>
                      {PORTFOLIO.map((item, idx) => (
                        <div key={idx} style={{ 
                          minWidth: "160px", 
                          backgroundColor: "rgba(255,255,255,0.05)", 
                          borderRadius: "12px", 
                          overflow: "hidden",
                          border: `1px solid ${THEME.border}`
                        }}>
                          <img src={item.img} style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                          <div style={{ padding: "8px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: THEME.accent }}>{item.title}</div>
                            <div style={{ fontSize: "10px", color: THEME.textMuted }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ 
                    fontSize: "10.5px", 
                    opacity: 0.6, 
                    textAlign: "right", 
                    marginTop: "2px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    {m.time}
                    {m.sender === "user" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#72deff" }}><path d="M18 6L7 17l-5-5"/><path d="M22 10L13.5 18.5l-2-2"/></svg>
                    )}
                  </div>
                  {m.options?.length > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {m.options.map((opt, k) => (
                        <button key={k} onClick={() => handleSend(opt)} className="option-btn">{opt}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && <div style={{ fontSize: "12px", color: THEME.textMuted, marginLeft: "10px", zIndex: 1, position: "relative" }}>Assistant is typing...</div>}
          </div>
        </div>

        <div style={{ ...STYLES.inputArea, textAlign: "center" }}>
          {messages.length === 0 && (
            <button className="hello-btn" onClick={() => handleSend("Hello")}>
              👋 Say Hello
            </button>
          )}
          <div style={STYLES.inputWrapper}>
            <textarea 
              style={STYLES.input} 
              value={val} 
              onChange={e => setVal(e.target.value)} 
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }} 
              placeholder="Ask me anything..."
              rows={1}
            />
            <button 
              style={{ ...STYLES.sendBtn, opacity: val.trim() ? 1 : 0.5 }} 
              onClick={() => handleSend()}
              disabled={!val.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}