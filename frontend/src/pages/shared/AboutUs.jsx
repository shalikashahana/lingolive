import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe2, BookOpen, Shield, Zap, Sparkles, 
  RefreshCcw, Layout, MessageSquare, ArrowRight,
  Mail, Twitter, Linkedin, Github
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const STATS = [
  { label: 'Languages', value: 9, suffix: '+' },
  { label: 'Lessons', value: 1000, suffix: '+' },
  { label: 'Support', value: 24, suffix: '/7' },
  { label: 'Responsive', value: 100, suffix: '%' }
];

// Reusable Counter Component
const Counter = ({ end, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
      {count}{suffix}
    </span>
  );
};

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden">
      {/* Navbar overlay for consistent navigation back */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-7xl mx-auto right-0">
        <Link to="/login" className="flex items-center gap-3 font-black text-2xl tracking-tight text-white hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          Mozhify
        </Link>
        <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>

      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0F172A] to-[#0F172A] z-0" />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeIn}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            Breaking Language Barriers, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">Connecting the World</span>
          </motion.h1>
          <motion.p 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Mozhify is your all-in-one platform to master multiple languages effortlessly. Experience an intuitive, engaging, and modern approach to global communication.
          </motion.p>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 pt-6"
          >
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] hover:scale-105 transition-all flex items-center gap-2"
            >
              Start Learning <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Who We Are */}
      <section className="py-24 px-6 bg-slate-900/50 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Who We Are</h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Mozhify is a modern multilingual learning website designed for learners of all ages. 
              Whether you are a beginner taking your first steps or an advanced learner refining your skills, 
              our platform provides an intuitive and engaging experience tailored for mastering different languages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Our Mission */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-2xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-slate-200 leading-snug">
              "Our mission is to make language learning simple, accessible, interactive, and enjoyable for everyone around the world."
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. Languages We Support */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Languages We Support</h2>
            <p className="text-slate-400 text-lg">Master the world's most spoken languages.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: 'English', icon: 'https://flagcdn.com/w40/gb.png', desc: 'The global language of business.' },
              { name: 'Telugu', icon: 'https://flagcdn.com/w40/in.png', desc: 'A classical Dravidian language.' },
              { name: 'Malayalam', icon: 'https://flagcdn.com/w40/in.png', desc: 'The beautiful language of Kerala.' },
              { name: 'Hindi', icon: 'https://flagcdn.com/w40/in.png', desc: 'The most spoken language in India.' },
              { name: 'Arabic', icon: 'https://flagcdn.com/w40/ae.png', desc: 'The rich language of the Middle East.' },
              { name: 'Korean', icon: 'https://flagcdn.com/w40/kr.png', desc: 'Dive into K-culture and Hangeul.' },
              { name: 'Chinese', icon: 'https://flagcdn.com/w40/cn.png', desc: 'The most spoken language globally.' },
              { name: 'Thai', icon: 'https://flagcdn.com/w40/th.png', desc: 'The language of the land of smiles.' },
              { name: 'Japanese', icon: 'https://flagcdn.com/w40/jp.png', desc: 'Discover Hiragana, Katakana, and Kanji.' }
            ].map((lang, idx) => (
              <motion.div 
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1 }}
                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 hover:-translate-y-2 transition-all cursor-pointer group"
              >
                <div className="w-10 h-auto mb-4 group-hover:scale-110 transition-transform origin-left rounded overflow-hidden">
                  <img src={lang.icon} alt={`${lang.name} flag`} className="w-full h-auto object-cover" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
                <p className="text-slate-400 text-sm">{lang.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-slate-400 text-lg">Built with modern learners in mind.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Interactive Lessons', icon: BookOpen, color: 'text-blue-400' },
              { title: 'Beginner Friendly', icon: Sparkles, color: 'text-pink-400' },
              { title: 'Fast Learning', icon: Zap, color: 'text-yellow-400' },
              { title: 'Responsive Design', icon: Layout, color: 'text-purple-400' },
              { title: 'Secure Platform', icon: Shield, color: 'text-green-400' },
              { title: 'Multi-language', icon: Globe2, color: 'text-cyan-400' },
              { title: 'Modern UX', icon: MessageSquare, color: 'text-rose-400' },
              { title: 'Continuous Updates', icon: RefreshCcw, color: 'text-indigo-400' },
            ].map((feature, idx) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-slate-700/50 transition-colors hover:shadow-lg"
              >
                <div className={`p-4 bg-slate-900 rounded-full mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-200">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Vision */}
      <section className="py-24 px-6 bg-slate-900/50 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <div className="inline-block p-4 bg-blue-500/10 text-blue-400 rounded-full mb-6">
              <Globe2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Vision</h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We envision a world where language is no longer a barrier but a bridge. 
              Our goal is to connect people globally through quality language education, 
              helping users build unshakeable confidence in communication.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 7. Statistics Section */}
      <section className="py-20 px-6 border-y border-white/5 bg-slate-950/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {STATS.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-2"
            >
              <Counter end={stat.value} suffix={stat.suffix} />
              <span className="text-slate-400 font-medium tracking-wide uppercase text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. Team Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet the Founders</h2>
            <p className="text-slate-400 text-lg">The brilliant minds behind Mozhify.</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 text-center hover:bg-slate-800/60 transition-colors group"
            >
              <div className="w-64 sm:w-80 mx-auto rounded-2xl overflow-hidden mb-6 border-4 border-slate-700 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <img src="/founders.png" alt="Shalika Shahana & Viviliya Joucy" className="w-full h-auto object-cover" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Shalika Shahana & Viviliya Joucy</h3>
              <p className="text-pink-400 font-medium mb-4 text-lg">Co-Founders & Developers</p>
              <p className="text-slate-400 text-base leading-relaxed">
                Passionate about bridging cultures through technology, accessible education, and building robust modern software systems that make language learning easy and engaging for everyone globally.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. Call to Action */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Start Your Language Journey Today</h2>
            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all inline-flex items-center gap-3"
            >
              Explore Languages <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 10. Feedback & Contact */}
      <section className="py-24 px-6 relative bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Feedback & Contact</h2>
            <p className="text-slate-400 text-lg">We'd love to hear from you. Get in touch with the developers!</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feedback Form */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Send Feedback ⭐</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for your feedback!"); e.target.reset(); }}>
                <textarea 
                  rows="5" 
                  placeholder="Tell us what you think about Mozhify..." 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors mb-4 resize-none"
                  required
                ></textarea>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25">
                  Submit Feedback
                </button>
              </form>
            </motion.div>

            {/* Contact Details */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 flex flex-col justify-center"
            >
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-bold text-pink-400 mb-3">Shalika Shahana</h4>
                  <p className="text-slate-300 flex items-center gap-3 mb-2"><Mail className="w-5 h-5 text-slate-500" /> shalikashahana@gmail.com</p>
                  <p className="text-slate-300 flex items-center gap-3 mb-2"><span className="text-slate-500 text-lg">📞</span> 8122260200</p>
                  <a href="https://www.linkedin.com/in/shalikashahana8/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-3"><Linkedin className="w-5 h-5" /> LinkedIn Profile</a>
                </div>
                <div className="h-px w-full bg-slate-700/50"></div>
                <div>
                  <h4 className="text-xl font-bold text-pink-400 mb-3">Viviliya Joicy</h4>
                  <p className="text-slate-300 flex items-center gap-3 mb-2"><Mail className="w-5 h-5 text-slate-500" /> viviliyajoicy@gmail.com</p>
                  <p className="text-slate-300 flex items-center gap-3 mb-2"><span className="text-slate-500 text-lg">📞</span> 63748 45122</p>
                  <a href="https://www.linkedin.com/in/viviliyajoicy24/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-3"><Linkedin className="w-5 h-5" /> LinkedIn Profile</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-[#0A0F1C] border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 mb-4">
              <Globe2 className="w-6 h-6 text-pink-500 inline-block" /> Mozhify
            </h3>
            <p className="text-slate-400 max-w-sm mb-6">
              Breaking language barriers and connecting the world through simple, interactive learning.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 hover:text-white text-slate-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white text-slate-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 hover:text-white text-slate-400 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/login" className="hover:text-pink-400 transition-colors">Start Learning</Link></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Languages</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-slate-800 text-slate-500 text-sm">
          © {new Date().getFullYear()} Mozhify. Developed by Shalika Shahana & Viviliya Joucy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
