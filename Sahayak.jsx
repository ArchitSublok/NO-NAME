import { useState, useRef, useEffect } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Chandigarh"
];

const SYSTEM_PROMPT_TEMPLATE = `You are SahayakAI — India's intelligent multilingual welfare scheme discovery assistant. You help Indian citizens find government schemes they are eligible for, explain eligibility criteria clearly, and provide step-by-step guidance.

USER PROFILE:
{PROFILE}

BEHAVIORAL RULES:
- If language preference is Hindi, respond entirely in Hindi (Devanagari script)
- Be warm, encouraging, and accessible — users may have low digital literacy
- Always present 3-5 most relevant schemes per response when asked about eligibility
- Format each scheme recommendation as:
  📌 **[SCHEME NAME]**
  ✅ Benefit: [what they get]
  🎯 Eligibility: [does this user qualify? mention specific criteria met]
  📝 Apply at: [portal/location in one line]
- End responses with a helpful follow-up question or prompt
- If the user's income/category/state makes them eligible for multiple schemes, prioritize by highest monetary benefit
- For state-specific schemes, only show schemes for the user's state

SCHEMES DATABASE (Central Government):

PM-KISAN: ₹6,000/year for small/marginal farmers (land ≤ 2 hectares). Apply: pmkisan.gov.in

Ayushman Bharat PMJAY: ₹5 lakh/year health insurance for bottom 50 crore beneficiaries (income < ₹5L, SECC listed). Apply: pmjay.gov.in

PM Awas Yojana Gramin: ₹1.2-1.5 lakh housing subsidy for BPL rural families without pucca house. Apply: pmayg.nic.in

PM Awas Yojana Urban: Up to ₹2.67 lakh subsidy for EWS (income < ₹3L) and LIG (< ₹6L) urban families. Apply: pmaymis.gov.in

PM Ujjwala Yojana: Free LPG connection + ₹1,600 subsidy for BPL/SC/ST/OBC women without existing gas connection. Apply: At nearest LPG distributor.

PM Jan Dhan Yojana: Zero-balance bank account, RuPay debit card, ₹2L accident insurance, ₹30K life cover for unbanked citizens. Apply: Any nationalized bank.

Sukanya Samriddhi Yojana: 8.2% interest savings scheme for girl children below 10 years. Tax-free maturity at 21. Apply: Post office or bank.

PM MUDRA Yojana: Collateral-free business loans — Shishu (up to ₹50K), Kishore (₹50K-5L), Tarun (₹5L-10L) for small/micro businesses. Apply: Banks, NBFCs.

PM Kaushal Vikas Yojana (PMKVY): Free skill certification training + ₹8,000 reward for youth 15-45 years. Apply: skillindiadigital.gov.in

Atal Pension Yojana: Guaranteed pension ₹1,000-5,000/month after age 60 for citizens 18-40 years with bank account. Apply: Any bank.

PM Suraksha Bima Yojana: ₹2 lakh accidental death coverage at just ₹20/year for bank account holders aged 18-70. Apply: Any bank.

PM Jeevan Jyoti Bima Yojana: ₹2 lakh life insurance at ₹436/year for ages 18-50 with bank account. Apply: Any bank.

PM Matru Vandana Yojana: ₹5,000 maternity benefit in 3 installments for first child; ₹6,000 for second child (if girl) for women 19+. Apply: Anganwadi center.

National Scholarship Portal: Scholarships ₹1,000-20,000/year for SC/ST/OBC/Minority students with family income < ₹2.5 lakh. Apply: scholarships.gov.in

PM SVANidhi: ₹10,000 collateral-free working capital loan for street vendors. Repeat loans up to ₹50,000. Apply: Through banks or loanapplication.freecharge.in

PM Garib Kalyan Anna Yojana: 5 kg free food grains per person/month for National Food Security Act beneficiaries (ration card holders). Apply: Fair Price Shop.

PM Employment Generation Programme (PMEGP): 15-35% subsidy on project cost (max ₹25L manufacturing / ₹10L service) for self-employment ventures. Apply: KVIC/KVIB/DIC.

Stand Up India: Loans ₹10L to ₹1 crore for SC/ST/Women entrepreneurs for first greenfield enterprise. Apply: standupmitra.in

Beti Bachao Beti Padhao: Conditional cash transfers and educational support for families with girl children. Apply: District Collectorate / Anganwadi.

SC/ST Post-Matric Scholarship: Full course fees + maintenance allowance for SC/ST students in post-secondary education (family income < ₹2.5L). Apply: scholarships.gov.in

STATE-SPECIFIC SCHEMES:
- Haryana: Ladli Scheme (₹5,000/year per girl child), Mukhyamantri Antyodaya Parivar Utthan (BPL uplift)
- Punjab: Atta Dal Scheme (50 kg atta + 2 kg dal monthly for BPL)
- UP: Kanya Sumangala Yojana (₹15,000 for girls' education milestones)
- Maharashtra: Mahatma Phule Jan Arogya Yojana (₹1.5L health coverage)
- Rajasthan: Mukhyamantri Chiranjeevi Yojana (₹10L health insurance)
- Delhi: Mukhyamantri Tirth Yatra Yojana (free pilgrimage for seniors 60+)
- Gujarat: Mukhyamantri Amrutum Yojana (₹5L health coverage for BPL)
- Tamil Nadu: CM's Comprehensive Health Insurance (₹5L for income < ₹72K)
- West Bengal: Lakshmir Bhandar (₹500-1000/month for homemakers)
- Karnataka: Gruha Jyothi (200 units free electricity for BPL)

Always mention if the user might qualify for additional state schemes and encourage them to check their state portal.`;

const C = {
  bg: '#070F20',
  bgCard: 'rgba(14,30,65,0.8)',
  bgInput: 'rgba(10,20,50,0.9)',
  accent: '#00CFFF',
  accentDim: 'rgba(0,207,255,0.12)',
  accentBorder: 'rgba(0,207,255,0.25)',
  success: '#00E5A0',
  text: '#D8EFFF',
  textMid: 'rgba(180,225,255,0.65)',
  textFaint: 'rgba(180,225,255,0.35)',
  border: 'rgba(255,255,255,0.07)',
  userBubble: 'rgba(0,180,255,0.12)',
  userBorder: 'rgba(0,180,255,0.3)',
  aiBubble: 'rgba(255,255,255,0.04)',
  aiBorder: 'rgba(255,255,255,0.07)',
};

const css = `
  @keyframes blink { 0%,100%{opacity:.25;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,207,255,0.4)} 70%{box-shadow:0 0 0 8px rgba(0,207,255,0)} }
  .msg-enter { animation: fadeIn 0.3s ease forwards; }
  .chip:hover { background: rgba(0,207,255,0.18) !important; border-color: rgba(0,207,255,0.4) !important; cursor:pointer; }
  .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 16px rgba(0,207,255,0.5); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cat-btn:hover { border-color: rgba(0,207,255,0.6) !important; }
  select option { background: #0D1E3A; color: #D8EFFF; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,207,255,0.2); border-radius: 2px; }
  textarea:focus, input:focus, select:focus { outline: none; border-color: rgba(0,207,255,0.5) !important; }
  textarea { scrollbar-width: thin; }
`;

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00CFFF">$1</strong>')
    .replace(/📌|✅|🎯|📝|🏥|🌾|🏠|💰|📚|💡|🤝|🔰|⭐/g, m => `<span style="font-size:15px">${m}</span>`)
    .replace(/\n/g, '<br/>');
}

function Landing({ onStart }) {
  const features = [
    { icon: '🔍', title: 'Smart Discovery', desc: 'AI matches your profile to 5,000+ schemes instantly' },
    { icon: '🗣️', title: 'Your Language', desc: 'Interact in Hindi or English — no barriers' },
    { icon: '📄', title: 'OCR Documents', desc: 'Upload certificates for instant eligibility check' },
    { icon: '⚡', title: '60 Seconds', desc: 'From profile to personalized scheme list' },
  ];
  return (
    <div style={{ background: C.bg, minHeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: '"Segoe UI", system-ui, sans-serif', position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,120,255,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,207,255,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, rgba(0,120,255,0.2), rgba(0,207,255,0.15))', border: `1.5px solid ${C.accent}`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 32, boxShadow: '0 0 30px rgba(0,207,255,0.2)' }}>🤝</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color: C.accent, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(0,207,255,0.1)', border: `1px solid ${C.accentBorder}`, borderRadius: 20, padding: '3px 10px' }}>HackDUCS · Team No Name</span>
      </div>

      <h1 style={{ color: C.text, fontSize: 44, fontWeight: 700, margin: '0 0 8px', letterSpacing: -1, textAlign: 'center' }}>
        Sahayak<span style={{ color: C.accent }}>AI</span>
      </h1>
      <p style={{ color: C.textMid, fontSize: 16, margin: '0 0 6px', textAlign: 'center', fontWeight: 400 }}>
        India ka Apna Welfare Scheme Advisor
      </p>
      <p style={{ color: C.textFaint, fontSize: 13.5, margin: '0 0 36px', textAlign: 'center', maxWidth: 380, lineHeight: 1.65 }}>
        Millions of eligible Indians miss out on ₹3 crore+ annually in unclaimed benefits. We fix that.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32, width: '100%', maxWidth: 440 }}>
        {features.map(f => (
          <div key={f.title} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
            <div style={{ color: C.textFaint, fontSize: 12, lineHeight: 1.4 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {[['5,000+','Schemes'],['22+','Languages'],['30%','Unclaimed']].map(([v,l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ color: C.accent, fontSize: 22, fontWeight: 700 }}>{v}</div>
            <div style={{ color: C.textFaint, fontSize: 11 }}>{l}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        style={{ background: 'linear-gradient(135deg, #00CFFF, #0070FF)', color: '#001020', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 0 30px rgba(0,207,255,0.35)', animation: 'pulse 2s infinite' }}
      >
        अपनी योजनाएं खोजें — Find My Schemes →
      </button>
      <p style={{ color: C.textFaint, fontSize: 11.5, marginTop: 12 }}>Free · Secure · No registration</p>
    </div>
  );
}

function Profile({ onComplete }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ name: '', age: '', state: '', income: '', category: 'General', occupation: '', language: 'en' });
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  const steps = [
    {
      title: 'Who are you?', subtitle: 'Basic personal information',
      fields: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Your Name" value={p.name} onChange={v => set('name', v)} placeholder="e.g. Ramesh Kumar" />
          <Field label="Age" type="number" value={p.age} onChange={v => set('age', v)} placeholder="e.g. 34" />
          <div>
            <label style={labelStyle}>State / UT</label>
            <select value={p.state} onChange={e => set('state', e.target.value)} style={inputStyle}>
              <option value="">— Select your state —</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ),
      valid: p.name && p.age && p.state,
    },
    {
      title: 'Financial Profile', subtitle: 'This helps match income-based schemes',
      fields: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Annual Household Income (₹)" type="number" value={p.income} onChange={v => set('income', v)} placeholder="e.g. 180000" />
          <div>
            <label style={labelStyle}>Social Category</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['General','OBC','SC','ST','EWS','Minority'].map(c => (
                <button key={c} className="cat-btn"
                  onClick={() => set('category', c)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${p.category === c ? C.accent : C.border}`, background: p.category === c ? C.accentDim : 'transparent', color: p.category === c ? C.accent : C.textMid, cursor: 'pointer', fontSize: 13, fontWeight: p.category === c ? 600 : 400, transition: 'all 0.2s' }}
                >{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Occupation</label>
            <select value={p.occupation} onChange={e => set('occupation', e.target.value)} style={inputStyle}>
              <option value="">— Select occupation —</option>
              {['Farmer','Student','Business Owner','Salaried Employee','Daily Wage Worker','Street Vendor','Homemaker','Unemployed','Self Employed','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      ),
      valid: p.income && p.occupation,
    },
    {
      title: 'Language Preference', subtitle: 'Choose how SahayakAI talks to you',
      fields: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ v: 'en', label: 'English', sub: 'Responses in English', flag: '🇬🇧' }, { v: 'hi', label: 'हिंदी', sub: 'जवाब हिंदी में मिलेंगे', flag: '🇮🇳' }].map(l => (
            <button key={l.v} onClick={() => set('language', l.v)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 12, border: `1.5px solid ${p.language === l.v ? C.accent : C.border}`, background: p.language === l.v ? C.accentDim : C.bgCard, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 28 }}>{l.flag}</span>
              <div>
                <div style={{ color: p.language === l.v ? C.accent : C.text, fontWeight: 600, fontSize: 16 }}>{l.label}</div>
                <div style={{ color: C.textFaint, fontSize: 12, marginTop: 2 }}>{l.sub}</div>
              </div>
              {p.language === l.v && <span style={{ marginLeft: 'auto', color: C.accent, fontSize: 18 }}>✓</span>}
            </button>
          ))}
        </div>
      ),
      valid: true,
    },
  ];

  const cur = steps[step];
  return (
    <div style={{ background: C.bg, minHeight: 600, display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", system-ui, sans-serif', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px 0', background: 'rgba(6,14,32,0.95)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 20 }}>🤝</div>
          <span style={{ color: C.accent, fontWeight: 700, fontSize: 15 }}>SahayakAI</span>
          <span style={{ color: C.textFaint, fontSize: 12, marginLeft: 'auto' }}>Step {step + 1} / {steps.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, paddingBottom: 18 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? C.accent : i === step ? 'linear-gradient(90deg, #00CFFF, rgba(0,207,255,0.4))' : C.border, transition: 'background 0.4s' }}>
              {i === step && <div style={{ height: '100%', background: C.accent, borderRadius: 2, width: '60%', transition: 'width 0.3s' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 20, padding: '3px 10px' }}>
          <span style={{ color: C.accent, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{cur.subtitle}</span>
        </div>
        <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: '8px 0 24px', letterSpacing: -0.3 }}>{cur.title}</h2>
        {cur.fields}
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: 'rgba(6,14,32,0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : null} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 18px', color: C.textMid, cursor: step > 0 ? 'pointer' : 'not-allowed', fontSize: 13, opacity: step > 0 ? 1 : 0.4 }}>← Back</button>
        {step < steps.length - 1 ? (
          <button onClick={() => cur.valid && setStep(s => s + 1)} style={{ background: cur.valid ? 'linear-gradient(135deg, #00CFFF, #0070FF)' : C.border, border: 'none', borderRadius: 10, padding: '9px 22px', color: cur.valid ? '#001020' : C.textFaint, cursor: cur.valid ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, transition: 'all 0.2s' }}>Continue →</button>
        ) : (
          <button onClick={() => onComplete(p)} style={{ background: 'linear-gradient(135deg, #00CFFF, #0070FF)', border: 'none', borderRadius: 10, padding: '9px 22px', color: '#001020', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Find My Schemes ✓</button>
        )}
      </div>
    </div>
  );
}

const labelStyle = { color: '#7AADCC', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: 0.3, textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: 'rgba(10,25,60,0.8)', border: '1px solid rgba(0,207,255,0.2)', borderRadius: 10, padding: '11px 14px', color: '#D8EFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'pointer', fontFamily: 'inherit' };

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, cursor: 'text' }} />
    </div>
  );
}

function Chat({ profile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const getSystemPrompt = () => SYSTEM_PROMPT_TEMPLATE.replace('{PROFILE}',
    `Name: ${profile.name || 'Not provided'} | Age: ${profile.age} | State: ${profile.state} | Annual Income: ₹${profile.income} | Category: ${profile.category} | Occupation: ${profile.occupation} | Language: ${profile.language === 'hi' ? 'Hindi' : 'English'}`
  );

  const callAPI = async (msgs) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: getSystemPrompt(), messages: msgs })
    });
    const data = await res.json();
    return data.content?.map(b => b.type === 'text' ? b.text : '').filter(Boolean).join('\n') || "Sorry, I couldn't process that. Please try again.";
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', content: msg }];
    setMessages(updated);
    setLoading(true);
    try {
      const reply = await callAPI(updated);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...updated, { role: 'assistant', content: profile.language === 'hi' ? 'कृपया दोबारा कोशिश करें। नेटवर्क त्रुटि।' : 'Network error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!started) {
      setStarted(true);
      const greet = profile.language === 'hi'
        ? `नमस्ते ${profile.name || 'जी'}! 🙏 मैं SahayakAI हूं। आपकी प्रोफाइल देखकर मैं आपको सबसे उपयुक्त सरकारी योजनाओं के बारे में बताऊंगा।`
        : `Welcome ${profile.name || 'there'}! 🙏 I'm SahayakAI. Let me find the best government schemes for your profile in ${profile.state}.`;
      setMessages([{ role: 'assistant', content: greet }]);
      setTimeout(() => {
        const q = profile.language === 'hi' ? 'मेरी प्रोफाइल के आधार पर मुझे कौन सी सरकारी योजनाओं का लाभ मिल सकता है?' : `Based on my profile (${profile.category} category, age ${profile.age}, income ₹${profile.income}/year, ${profile.occupation} in ${profile.state}), which government schemes am I eligible for?`;
        setMessages(prev => [...prev, { role: 'user', content: q }]);
        setLoading(true);
        callAPI([{ role: 'user', content: q }]).then(r => {
          setMessages(prev => [...prev, { role: 'assistant', content: r }]);
          setLoading(false);
        }).catch(() => setLoading(false));
      }, 600);
    }
  }, []);

  const chips = profile.language === 'hi'
    ? ['स्वास्थ्य योजनाएं', 'किसान योजना', 'शिक्षा छात्रवृत्ति', 'व्यापार ऋण', 'आवास योजना', 'बीमा योजना']
    : ['Health insurance', 'Farm schemes', 'Education scholarships', 'Business loans', 'Housing subsidy', 'Insurance plans'];

  return (
    <div style={{ background: C.bg, height: 660, display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", system-ui, sans-serif', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', background: 'rgba(4,10,28,0.97)', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, rgba(0,120,255,0.2), rgba(0,207,255,0.15))', border: `1.5px solid ${C.accent}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 12px rgba(0,207,255,0.2)' }}>🤝</div>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>SahayakAI</div>
          <div style={{ color: C.success, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: C.success, borderRadius: '50%', display: 'inline-block' }} />
            Online · {profile.state}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 20, padding: '3px 10px', color: C.accent, fontSize: 11, fontWeight: 600 }}>{profile.category}</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '3px 10px', color: C.textMid, fontSize: 11 }}>₹{parseInt(profile.income || 0).toLocaleString('en-IN')}/yr</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} className="msg-enter" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 8 }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, rgba(0,120,255,0.2), rgba(0,207,255,0.15))', border: `1px solid ${C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>
            )}
            <div style={{ maxWidth: '78%', background: msg.role === 'user' ? C.userBubble : C.aiBubble, border: `1px solid ${msg.role === 'user' ? C.userBorder : C.aiBorder}`, borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '10px 14px', color: C.text, fontSize: 13.5, lineHeight: 1.65 }}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
            {msg.role === 'user' && (
              <div style={{ width: 30, height: 30, background: 'rgba(0,120,255,0.15)', border: `1px solid ${C.userBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2, color: C.accent }}>
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, rgba(0,120,255,0.2), rgba(0,207,255,0.15))', border: `1px solid ${C.accentBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ background: C.aiBubble, border: `1px solid ${C.aiBorder}`, borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, background: C.accent, borderRadius: '50%', display: 'inline-block', animation: `blink 1.2s ${i * 0.22}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length < 4 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {chips.map(c => (
            <button key={c} className="chip"
              onClick={() => sendMessage(c)}
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px', color: C.textMid, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}
            >{c}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, background: 'rgba(4,10,28,0.97)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={profile.language === 'hi' ? 'योजनाओं के बारे में पूछें...' : 'Ask about schemes, eligibility, documents needed...'}
          rows={1}
          style={{ flex: 1, background: C.bgInput, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 13.5, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100, outline: 'none' }}
        />
        <button className="send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #00CFFF, #0060FF)', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, transition: 'all 0.2s', color: '#001020', fontWeight: 700 }}
        >↑</button>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState(null);

  return (
    <>
      <style>{css}</style>
      {view === 'landing' && <Landing onStart={() => setView('profile')} />}
      {view === 'profile' && <Profile onComplete={p => { setProfile(p); setView('chat'); }} />}
      {view === 'chat' && profile && <Chat profile={profile} />}
    </>
  );
}
