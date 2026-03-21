export const bridgePageTemplates = [
  // Layout 1: Modern Dark (Neon)
  (result: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');
        body { font-family: 'Outfit', sans-serif; background: #0a0a0a; color: #fff; }
        .neon-glow { text-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899; }
        .gradient-bg { background: linear-gradient(135deg, #0a0a0a 0%, #1f0515 100%); }
        .btn-neon { 
            background: linear-gradient(90deg, #ec4899, #db2777);
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
        }
        .btn-neon:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(236, 72, 153, 0.8); }
        @keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-6">
    <div class="max-w-3xl w-full text-center space-y-8">
        <h1 class="text-5xl md:text-7xl font-black neon-glow animate-pulse-glow">${result.headline}</h1>
        <p class="text-xl text-gray-300 leading-relaxed">${result.story}</p>
        <div class="p-8 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10">
            <h2 class="text-2xl font-bold text-pink-400 mb-4">The Problem</h2>
            <p class="text-lg text-gray-200">${result.gap}</p>
        </div>
        <div class="p-8 bg-pink-900/10 backdrop-blur-lg rounded-3xl border border-pink-500/20">
            <h2 class="text-2xl font-bold text-pink-300 mb-4">The Solution</h2>
            <p class="text-lg text-gray-200">${result.bridge}</p>
        </div>
        <button class="btn-neon text-white text-2xl font-bold px-12 py-6 rounded-full">${result.cta}</button>
    </div>
</body>
</html>
  `,
  // Layout 2: Clean Professional
  (result: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
        .card { background: white; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .btn-primary { background: #2563eb; transition: all 0.2s; }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-2xl w-full space-y-10 py-12">
        <header class="text-center space-y-4">
            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">${result.headline}</h1>
            <div class="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </header>
        
        <main class="space-y-8">
            <div class="prose prose-slate max-w-none">
                <p class="text-lg leading-relaxed text-slate-600">${result.story}</p>
            </div>
            
            <div class="grid gap-6">
                <div class="card p-8 rounded-2xl">
                    <h2 class="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">The Challenge</h2>
                    <p class="text-slate-700 leading-relaxed">${result.gap}</p>
                </div>
                
                <div class="card p-8 rounded-2xl border-l-4 border-l-blue-600">
                    <h2 class="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">The Breakthrough</h2>
                    <p class="text-slate-700 leading-relaxed">${result.bridge}</p>
                </div>
            </div>
        </main>

        <footer class="text-center pt-4">
            <button class="btn-primary text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg w-full md:w-auto">
                ${result.cta}
            </button>
            <p class="mt-6 text-sm text-slate-400">Secure & Private Access</p>
        </footer>
    </div>
</body>
</html>
  `,
  // Layout 3: High-Conversion (Aggressive)
  (result: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Roboto:wght@400;700&display=swap');
        body { font-family: 'Roboto', sans-serif; background: #fff; color: #000; }
        .headline { font-family: 'Archivo Black', sans-serif; text-transform: uppercase; line-height: 1; }
        .highlight { background: yellow; padding: 0 4px; }
        .btn-urgent { background: #e11d48; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    </style>
</head>
<body class="p-4 md:p-12">
    <div class="max-w-4xl mx-auto border-4 border-black p-6 md:p-12 space-y-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div class="text-center space-y-6">
            <div class="inline-block bg-black text-white px-4 py-1 text-sm font-bold uppercase tracking-widest">Important Message</div>
            <h1 class="headline text-4xl md:text-6xl">${result.headline}</h1>
        </div>

        <div class="text-xl md:text-2xl leading-tight space-y-6 italic font-medium border-l-8 border-yellow-400 pl-6">
            ${result.story}
        </div>

        <div class="bg-slate-50 p-8 border-2 border-black">
            <h2 class="text-2xl font-black uppercase mb-4 underline decoration-4 decoration-yellow-400">Wait... Does this sound like you?</h2>
            <p class="text-lg">${result.gap}</p>
        </div>

        <div class="text-center space-y-8">
            <p class="text-2xl font-bold"><span class="highlight">Finally, there's a better way...</span></p>
            <p class="text-xl">${result.bridge}</p>
            
            <div class="pt-6">
                <button class="btn-urgent text-white text-3xl font-black px-12 py-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    ${result.cta}
                </button>
            </div>
            <p class="text-sm font-bold uppercase text-red-600">Limited Time Offer - Act Now!</p>
        </div>
    </div>
</body>
</html>
  `,
  // Layout 4: Minimalist Whiteboard
  (result: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f0f0f0; background-image: radial-gradient(#d1d1d1 1px, transparent 1px); background-size: 20px 20px; }
        .handwritten { font-family: 'Kalam', cursive; }
        .paper { background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-radius: 2px; position: relative; }
        .paper::before { content: ''; position: absolute; top: 0; left: 40px; height: 100%; width: 2px; background: rgba(255,0,0,0.1); }
    </style>
</head>
<body class="min-h-screen py-12 px-4">
    <div class="max-w-3xl mx-auto paper p-12 md:p-20">
        <h1 class="text-4xl md:text-5xl font-bold mb-12 text-slate-900 leading-tight">
            ${result.headline}
        </h1>
        
        <div class="space-y-10 text-xl text-slate-700">
            <p class="handwritten text-2xl text-blue-600">${result.story}</p>
            
            <div class="space-y-4">
                <p class="font-bold text-slate-900">The Problem:</p>
                <p>${result.gap}</p>
            </div>
            
            <div class="space-y-4">
                <p class="font-bold text-slate-900">The Solution:</p>
                <p>${result.bridge}</p>
            </div>
        </div>
        
        <div class="mt-16">
            <button class="w-full bg-slate-900 text-white py-5 rounded-lg font-bold text-2xl hover:bg-slate-800 transition-colors">
                ${result.cta}
            </button>
        </div>
    </div>
</body>
</html>
  `,
  // Layout 5: High-Tech Dark
  (result: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Space Grotesk', sans-serif; background: #050505; color: #fff; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .grid-bg { background-image: linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px); background-size: 50px 50px; }
        .scanline { width: 100%; height: 2px; background: rgba(0, 255, 0, 0.1); position: fixed; top: 0; left: 0; z-index: 10; animation: scan 8s linear infinite; }
        @keyframes scan { from { top: 0; } to { top: 100%; } }
        .glow-border { border: 1px solid #00ff00; box-shadow: 0 0 15px rgba(0, 255, 0, 0.2); }
    </style>
</head>
<body class="grid-bg min-h-screen p-6 md:p-12">
    <div class="scanline"></div>
    <div class="max-w-4xl mx-auto space-y-12">
        <div class="flex justify-between items-center mono text-[10px] text-green-500 opacity-50 uppercase tracking-[0.5em]">
            <span>System Active</span>
            <span>Bridge Protocol v4.0</span>
        </div>
        
        <h1 class="text-5xl md:text-8xl font-bold tracking-tighter leading-none">
            ${result.headline}
        </h1>
        
        <div class="grid md:grid-cols-2 gap-12">
            <div class="space-y-8">
                <div class="glow-border p-8 bg-black/50 backdrop-blur">
                    <p class="mono text-xs text-green-500 mb-4 uppercase tracking-widest">// Initializing Story</p>
                    <p class="text-xl leading-relaxed">${result.story}</p>
                </div>
                <div class="p-8 border border-white/10">
                    <p class="mono text-xs text-gray-500 mb-4 uppercase tracking-widest">// Analyzing Gap</p>
                    <p class="text-gray-400">${result.gap}</p>
                </div>
            </div>
            <div class="space-y-8">
                <div class="glow-border p-8 bg-green-500/5 backdrop-blur">
                    <p class="mono text-xs text-green-500 mb-4 uppercase tracking-widest">// Bridge Established</p>
                    <p class="text-xl leading-relaxed text-green-100">${result.bridge}</p>
                </div>
                <button class="w-full bg-green-500 text-black py-6 font-black text-2xl uppercase tracking-tighter hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                    ${result.cta}
                </button>
            </div>
        </div>
    </div>
</body>
</html>
  `
];

export const landingPageTemplates = [
  // Layout 1: Modern Glassmorphism (Current)
  (result: any, theme: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: ${theme.primary};
            --secondary: ${theme.secondary};
            --bg: ${theme.bg};
            --accent: ${theme.accent};
        }
        body { font-family: '${theme.font}', sans-serif; background-color: var(--bg); color: #ffffff; overflow-x: hidden; }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .neon-text { text-shadow: 0 0 10px var(--primary); }
        .neon-border { border: 1px solid var(--primary); box-shadow: 0 0 15px var(--primary); }
        .vsl-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 24px; background: #111; border: 1px solid rgba(255,255,255,0.1); }
        .vsl-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); cursor: pointer; }
        .vsl-overlay:hover { background: rgba(0,0,0,0.2); }
        .play-button { width: 80px; height: 80px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px var(--primary); transition: transform 0.2s; }
        .vsl-overlay:hover .play-button { transform: scale(1.1); }
        .progress-bar { height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); width: 45%; animation: progress 20s linear infinite; }
        @keyframes progress { 0% { width: 0%; } 100% { width: 95%; } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .gradient-text { background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-btn { background: linear-gradient(to right, var(--primary), var(--secondary)); transition: all 0.3s ease; }
        .gradient-btn:hover { filter: brightness(1.2); transform: scale(1.05); box-shadow: 0 0 20px var(--primary); }
        .blob { position: absolute; width: 500px; height: 500px; background: var(--primary); filter: blur(100px); opacity: 0.15; border-radius: 50%; z-index: -1; animation: move 20s infinite alternate; }
        @keyframes move { from { transform: translate(-10%, -10%) scale(1); } to { transform: translate(10%, 10%) scale(1.2); } }
    </style>
</head>
<body class="selection:bg-indigo-500/30">
    <div class="blob" style="top: 0; left: 0;"></div>
    <div class="blob" style="bottom: 0; right: 0; background: var(--secondary);"></div>
    <div class="bg-indigo-600 text-white py-2 text-center text-xs font-bold uppercase tracking-widest" style="background: var(--primary)">
        ⚠️ LIMITED TIME OFFER: ${result.scarcityMessage || 'Access closing soon'}
    </div>
    <header class="pt-20 pb-16 px-6">
        <div class="max-w-5xl mx-auto text-center">
            <span class="inline-block text-indigo-400 font-bold uppercase tracking-[0.2em] text-sm mb-6 animate-pulse" style="color: var(--primary)">
                ${result.preHeadline}
            </span>
            <h1 class="text-4xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white animate-float">
                <span class="gradient-text">${result.heroHeadline}</span>
            </h1>
            <p class="text-xl md:text-2xl mb-12 text-gray-400 max-w-3xl mx-auto font-medium">
                ${result.heroSubheadline}
            </p>
            <div class="max-w-4xl mx-auto mb-12">
                <div class="vsl-container shadow-2xl shadow-indigo-500/10">
                    <div class="vsl-overlay">
                        <div class="play-button">
                            <svg class="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <p class="mt-6 text-white font-bold text-lg tracking-wide uppercase">${result.vslHook || 'Click to Play Video'}</p>
                    </div>
                </div>
                <div class="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">
                    <span>Video Loading...</span>
                    <span>95% Complete</span>
                </div>
                <div class="progress-bar mt-2">
                    <div class="progress-fill"></div>
                </div>
            </div>
            <a href="#order" class="inline-block gradient-btn text-white px-10 py-5 rounded-2xl font-extrabold text-xl shadow-2xl active:scale-95">
                ${result.heroCTA}
            </a>
        </div>
    </header>
    <section class="py-24 px-6 glass">
        <div class="max-w-3xl mx-auto">
            <h2 class="font-bold uppercase tracking-widest text-sm mb-8 text-center" style="color: var(--primary)">The Brutal Truth</h2>
            <div class="space-y-6 text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
                ${result.problemAgitation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>
        </div>
    </section>
    <section class="py-24 px-6 relative overflow-hidden">
        <div class="max-w-5xl mx-auto">
            <div class="text-center mb-20">
                <h2 class="text-3xl md:text-5xl font-bold mb-8">The "Unique Mechanism"</h2>
                <p class="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">${result.solutionPresentation}</p>
            </div>
            <div class="glass p-10 rounded-[32px]">
                <h3 class="text-2xl font-bold mb-10 text-white flex items-center gap-3">
                    <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: var(--primary)">✓</span>
                    What You're Getting Today
                </h3>
                <ul class="grid md:grid-cols-2 gap-6">
                    ${result.keyBenefits.map((benefit: string) => `
                        <li class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                            <span class="font-bold text-xl mt-1" style="color: var(--primary)">→</span>
                            <span class="text-lg text-gray-300 font-medium">${benefit}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </section>
    <section class="py-24 px-6 glass">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl md:text-5xl font-bold text-center mb-20">Real Results From Real People</h2>
            <div class="grid md:grid-cols-2 gap-8">
                ${result.testimonials.map((t: any) => `
                    <div class="bg-white/5 p-10 rounded-[32px] border border-white/5 relative hover:scale-[1.02] transition-transform">
                        <div class="absolute -top-4 -left-4 w-12 h-12 rounded-2xl flex items-center justify-center text-4xl font-serif opacity-20" style="background: var(--primary)">"</div>
                        <p class="text-gray-300 text-lg italic mb-10 leading-relaxed">"${t.quote}"</p>
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl border" style="background: var(--primary); opacity: 0.2; border-color: var(--primary)">
                                ${t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-bold text-white text-lg">${t.name}</h4>
                                <p class="text-sm font-bold uppercase tracking-widest" style="color: var(--primary)">${t.role}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    <section id="order" class="py-32 px-6 text-center">
        <div class="max-w-4xl mx-auto">
            <div class="inline-block px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-red-500/20">
                🚨 ${result.scarcityMessage}
            </div>
            <h2 class="text-4xl md:text-6xl font-extrabold mb-10 leading-tight">Secure Your Spot Before The Timer Hits Zero</h2>
            <a href="#" class="inline-block gradient-btn text-white px-12 py-6 rounded-2xl font-extrabold text-2xl shadow-2xl hover:scale-[1.05] transition-all active:scale-95 mb-8">
                ${result.finalCTA}
            </a>
            <p class="text-gray-500 font-medium">30-Day Money Back Guarantee • Secure Checkout</p>
        </div>
    </section>
    <footer class="py-16 border-t border-white/5 text-center">
        <div class="max-w-5xl mx-auto px-6 text-gray-600 text-xs uppercase tracking-widest">
            <div class="flex justify-center gap-8 mb-8">
                <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
            </div>
            <p>&copy; 2026 All Rights Reserved</p>
        </div>
    </footer>
</body>
</html>
  `,
  // Layout 2: Editorial / Minimalist
  (result: any, theme: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #fff; color: #111; }
        .serif { font-family: 'Cormorant Garamond', serif; }
        .accent-bg { background-color: ${theme.primary}; }
        .accent-text { color: ${theme.primary}; }
        .border-accent { border-color: ${theme.primary}; }
        .vsl-box { background: #000; aspect-ratio: 16/9; display: grid; place-items: center; cursor: pointer; }
        .divider { height: 1px; background: #eee; width: 100%; margin: 4rem 0; }
    </style>
</head>
<body class="p-6 md:p-12">
    <nav class="max-w-6xl mx-auto flex justify-between items-center mb-20">
        <div class="font-bold text-xl uppercase tracking-tighter">Edition 2026</div>
        <div class="text-xs font-bold uppercase tracking-widest opacity-50">Limited Access Only</div>
    </nav>

    <main class="max-w-4xl mx-auto">
        <header class="text-center mb-24">
            <p class="accent-text font-bold uppercase tracking-widest text-xs mb-6">${result.preHeadline}</p>
            <h1 class="serif text-5xl md:text-8xl leading-[0.9] mb-12">${result.heroHeadline}</h1>
            <p class="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">${result.heroSubheadline}</p>
        </header>

        <div class="vsl-box mb-24 group relative">
            <div class="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="absolute bottom-8 left-8 text-white/50 text-[10px] uppercase tracking-widest font-bold">${result.vslHook}</div>
        </div>

        <div class="grid md:grid-cols-12 gap-12 mb-24">
            <div class="md:col-span-4">
                <h2 class="serif text-3xl italic">The Problem</h2>
            </div>
            <div class="md:col-span-8 space-y-6 text-lg text-gray-600 leading-relaxed">
                ${result.problemAgitation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>
        </div>

        <div class="divider"></div>

        <div class="grid md:grid-cols-12 gap-12 mb-24">
            <div class="md:col-span-4">
                <h2 class="serif text-3xl italic">The Solution</h2>
            </div>
            <div class="md:col-span-8">
                <p class="text-2xl mb-12 leading-tight font-medium">${result.solutionPresentation}</p>
                <ul class="space-y-4">
                    ${result.keyBenefits.map((benefit: string) => `
                        <li class="flex items-center gap-4 py-4 border-b border-gray-100">
                            <span class="accent-text font-bold">/</span>
                            <span class="text-lg">${benefit}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <div class="divider"></div>

        <div class="mb-24">
            <h2 class="serif text-4xl text-center mb-16">Community Feedback</h2>
            <div class="grid md:grid-cols-2 gap-12">
                ${result.testimonials.map((t: any) => `
                    <div class="space-y-6">
                        <p class="text-xl serif italic leading-relaxed">"${t.quote}"</p>
                        <div>
                            <p class="font-bold uppercase text-xs tracking-widest">${t.name}</p>
                            <p class="text-[10px] uppercase tracking-widest opacity-50">${t.role}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="accent-bg p-12 md:p-24 text-center text-white rounded-[40px]">
            <p class="text-xs font-bold uppercase tracking-widest mb-8 opacity-70">${result.scarcityMessage}</p>
            <h2 class="serif text-4xl md:text-6xl mb-12">${result.finalCTA}</h2>
            <a href="#" class="inline-block bg-white text-black px-12 py-6 rounded-full font-bold uppercase text-sm tracking-widest hover:invert transition-all">
                Get Started Now
            </a>
        </div>
    </main>

    <footer class="max-w-6xl mx-auto mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-widest opacity-30">
        <p>&copy; 2026 All Rights Reserved</p>
        <div class="flex gap-8">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
        </div>
    </footer>
</body>
</html>
  `,
  // Layout 3: Dark Mode VSL Focus
  (result: any, theme: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #000; color: #fff; }
        .accent-text { color: ${theme.primary}; }
        .accent-bg { background: ${theme.primary}; }
        .vsl-frame { border: 2px solid ${theme.primary}; box-shadow: 0 0 30px ${theme.primary}44; }
    </style>
</head>
<body class="bg-black">
    <div class="max-w-5xl mx-auto py-12 px-6">
        <div class="text-center mb-12">
            <p class="text-red-500 font-bold uppercase tracking-widest text-sm mb-4">🚨 ${result.scarcityMessage}</p>
            <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight">${result.heroHeadline}</h1>
            <p class="text-xl text-gray-400 max-w-3xl mx-auto">${result.heroSubheadline}</p>
        </div>

        <div class="vsl-frame aspect-video bg-zinc-900 rounded-3xl flex items-center justify-center mb-12 relative overflow-hidden group cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div class="z-10 text-center">
                <div class="w-24 h-24 rounded-full accent-bg flex items-center justify-center mb-4 mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                    <svg class="w-10 h-10 text-black fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p class="text-xl font-bold uppercase tracking-widest">${result.vslHook}</p>
            </div>
        </div>

        <div class="text-center mb-24">
            <a href="#order" class="accent-bg text-black px-12 py-6 rounded-full font-black text-2xl uppercase tracking-tighter hover:scale-105 transition-transform inline-block">
                ${result.heroCTA}
            </a>
        </div>

        <div class="grid md:grid-cols-2 gap-16 mb-32">
            <div class="space-y-8">
                <h2 class="text-3xl font-bold border-l-4 border-red-500 pl-6">The Problem</h2>
                <div class="text-gray-400 text-lg leading-relaxed space-y-4">
                    ${result.problemAgitation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
                </div>
            </div>
            <div class="space-y-8">
                <h2 class="text-3xl font-bold border-l-4 border-green-500 pl-6">The Solution</h2>
                <p class="text-xl">${result.solutionPresentation}</p>
                <ul class="space-y-4">
                    ${result.keyBenefits.map((benefit: string) => `
                        <li class="flex items-center gap-3">
                            <span class="text-green-500">✔</span>
                            <span>${benefit}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <div class="bg-zinc-900 p-12 rounded-[3rem] text-center">
            <h2 class="text-4xl font-bold mb-12">What Our Members Say</h2>
            <div class="grid md:grid-cols-2 gap-8">
                ${result.testimonials.map((t: any) => `
                    <div class="bg-black/40 p-8 rounded-2xl text-left border border-white/5">
                        <p class="text-gray-300 italic mb-6">"${t.quote}"</p>
                        <p class="font-bold">${t.name}</p>
                        <p class="text-xs text-gray-500 uppercase">${t.role}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div id="order" class="py-32 text-center">
            <h2 class="text-5xl md:text-7xl font-black mb-12">${result.finalCTA}</h2>
            <a href="#" class="accent-bg text-black px-16 py-8 rounded-full font-black text-3xl uppercase tracking-tighter hover:scale-110 transition-transform inline-block shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                JOIN NOW
            </a>
        </div>
    </div>
</body>
</html>
  `,
  // Layout 4: Clean Grid Layout
  (result: any, theme: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #f8fafc; color: #0f172a; }
        .accent-text { color: ${theme.primary}; }
        .accent-bg { background: ${theme.primary}; }
        .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
    </style>
</head>
<body class="bg-slate-50">
    <div class="max-w-6xl mx-auto px-6 py-12">
        <header class="text-center mb-32">
            <div class="inline-block px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">${result.preHeadline}</div>
            <h1 class="text-5xl md:text-8xl font-black mb-8 tracking-tight">${result.heroHeadline}</h1>
            <p class="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12">${result.heroSubheadline}</p>
            <a href="#order" class="accent-bg text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-200 hover:brightness-110 transition-all inline-block">
                ${result.heroCTA}
            </a>
        </header>

        <div class="grid md:grid-cols-3 gap-8 mb-32">
            <div class="md:col-span-2 card p-12">
                <h2 class="text-3xl font-bold mb-8">The Challenge</h2>
                <div class="text-slate-600 text-lg space-y-4">
                    ${result.problemAgitation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
                </div>
            </div>
            <div class="card p-12 bg-slate-900 text-white border-none">
                <h2 class="text-3xl font-bold mb-8">The Vision</h2>
                <p class="text-slate-400 leading-relaxed">${result.solutionPresentation}</p>
            </div>
        </div>

        <div class="mb-32">
            <h2 class="text-4xl font-bold text-center mb-16">Key Benefits</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${result.keyBenefits.map((benefit: string) => `
                    <div class="card p-8 flex flex-col items-center text-center">
                        <div class="w-12 h-12 rounded-2xl accent-bg/10 accent-text flex items-center justify-center mb-6 font-bold text-xl">
                            ${result.keyBenefits.indexOf(benefit) + 1}
                        </div>
                        <p class="font-bold">${benefit}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-32">
            ${result.testimonials.map((t: any) => `
                <div class="card p-10">
                    <p class="text-xl text-slate-600 italic mb-8">"${t.quote}"</p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">${t.name.charAt(0)}</div>
                        <div>
                            <p class="font-bold">${t.name}</p>
                            <p class="text-xs text-slate-400 uppercase font-bold tracking-widest">${t.role}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div id="order" class="card p-12 md:p-24 text-center bg-white border-2 border-indigo-600">
            <p class="text-red-500 font-bold uppercase tracking-widest text-sm mb-6">${result.scarcityMessage}</p>
            <h2 class="text-4xl md:text-6xl font-black mb-12">${result.finalCTA}</h2>
            <a href="#" class="accent-bg text-white px-16 py-8 rounded-2xl font-black text-2xl hover:scale-105 transition-transform inline-block shadow-2xl shadow-indigo-200">
                GET INSTANT ACCESS
            </a>
        </div>
    </div>
</body>
</html>
  `,
  // Layout 5: Minimalist High-Ticket
  (result: any, theme: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Space Grotesk', sans-serif; background: #fff; color: #000; }
        .accent-text { color: ${theme.primary}; }
        .accent-bg { background: ${theme.primary}; }
        .line { height: 1px; background: #000; width: 100%; margin: 2rem 0; }
    </style>
</head>
<body class="p-8 md:p-24">
    <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-32">
            <div class="font-bold tracking-tighter text-2xl italic">PRIVATE ACCESS</div>
            <div class="text-xs font-bold uppercase tracking-[0.3em] opacity-30">EST. 2026</div>
        </div>

        <header class="mb-32">
            <p class="accent-text font-bold uppercase tracking-widest text-xs mb-8">${result.preHeadline}</p>
            <h1 class="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.85] mb-12">${result.heroHeadline}</h1>
            <p class="text-2xl md:text-3xl font-light text-gray-500 leading-tight">${result.heroSubheadline}</p>
        </header>

        <div class="aspect-video bg-gray-100 mb-32 flex items-center justify-center group cursor-pointer border border-black/5">
            <div class="text-center">
                <div class="w-16 h-16 rounded-full border border-black flex items-center justify-center mb-4 mx-auto group-hover:bg-black group-hover:text-white transition-all">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest opacity-50">${result.vslHook}</p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-24 mb-32">
            <div class="space-y-12">
                <h2 class="text-sm font-bold uppercase tracking-widest opacity-30">The Context</h2>
                <div class="text-2xl leading-snug space-y-6">
                    ${result.problemAgitation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
                </div>
            </div>
            <div class="space-y-12">
                <h2 class="text-sm font-bold uppercase tracking-widest opacity-30">The Solution</h2>
                <div class="text-2xl leading-snug space-y-6">
                    <p class="font-bold">${result.solutionPresentation}</p>
                    <ul class="space-y-4 text-lg text-gray-500">
                        ${result.keyBenefits.map((benefit: string) => `<li>— ${benefit}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="line"></div>

        <div class="mb-32">
            <h2 class="text-sm font-bold uppercase tracking-widest opacity-30 mb-16">Testimonials</h2>
            <div class="space-y-24">
                ${result.testimonials.map((t: any) => `
                    <div class="max-w-2xl">
                        <p class="text-4xl font-light leading-tight mb-8">"${t.quote}"</p>
                        <p class="font-bold uppercase tracking-widest text-xs">${t.name} / ${t.role}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="bg-black text-white p-12 md:p-24 rounded-sm text-center">
            <p class="text-xs font-bold uppercase tracking-[0.5em] mb-12 opacity-50">${result.scarcityMessage}</p>
            <h2 class="text-4xl md:text-7xl font-bold tracking-tighter mb-12 leading-none">${result.finalCTA}</h2>
            <a href="#" class="inline-block border border-white px-12 py-6 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Submit Application
            </a>
        </div>
    </div>
</body>
</html>
  `
];


