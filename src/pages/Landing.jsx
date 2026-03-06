import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { ArrowRight, PenTool, Share2, Users, GitFork, Code, Briefcase, Map, MapPin, Heart, MessageCircle, Bookmark } from "lucide-react";
import { ContainerScroll } from "../components/ui/container-scroll-animation";

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
    useGSAP(() => {
        // Hero Animation
        gsap.from(".hero-title span", {
            y: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power4.out",
            delay: 0.2
        });

        gsap.from(".hero-subtitle", {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.8
        });

        gsap.from(".hero-cta", {
            scale: 0.9,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        // Feature Cards Scroll Animation
        const cards = gsap.utils.toArray(".feature-card");
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%", // Start animation when the top of the card is 85% down the viewport
                    end: "top 30%",   // End when it reaches 30% down
                    scrub: 1
                },
                y: 100,
                opacity: 0,
                rotationX: 45,
                transformOrigin: "top center"
            });
        });

        // Final CTA text reveal
        gsap.from(".final-cta-text", {
            scrollTrigger: {
                trigger: ".final-section",
                start: "top 80%",
                end: "top 40%",
                scrub: 1
            },
            clipPath: "inset(0 100% 0 0)"
        });
    });

    return (
        <div className="bg-[#0f0f11] min-h-screen selection:bg-purple-500/30 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#0f0f11]/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-8">
                <div className="text-2xl font-bold tracking-tighter text-white">BLOQ.</div>
                <div className="flex items-center gap-6">
                    <Link to="/auth" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sign In</Link>
                    <Link to="/auth" className="btn-primary text-sm !py-2 !px-6">Join Now</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center pt-20 pb-10 w-full relative mt-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_50%)] pointer-events-none" />

                <ContainerScroll
                    titleComponent={
                        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
                            <h1 className="hero-title text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.9] text-white flex flex-wrap justify-center gap-x-4 uppercase mb-2">
                                <span>Code.</span>
                                <span>Create.</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Connect.</span>
                            </h1>

                            <p className="hero-subtitle mt-6 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-paragraph leading-relaxed">
                                The premium social space for developers. Share your journey, write high-quality technical blogs, and connect with the top 1% of builders.
                            </p>

                            <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/auth" className="btn-primary flex items-center gap-2 group text-lg">
                                    Start Writing <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/feed" className="btn-secondary text-lg">
                                    Explore Feed
                                </Link>
                            </div>
                        </div>
                    }
                >
                    <img
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero preview showcasing code editor"
                        className="mx-auto rounded-2xl object-cover h-full w-full object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </section>

            {/* Features Showcase */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-6xl mx-auto space-y-32">

                    {/* Feature 1 */}
                    <div className="feature-card flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex-center text-purple-400">
                                <PenTool size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Distraction-Free Writing</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Our editor is designed to get out of your way. Focus on your code and your thoughts. Format with markdown, embed snippets, and publish beautiful articles instantly.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card p-6 h-80 flex flex-col gap-4 relative z-10 transform hover:-translate-y-2 transition-transform duration-500">
                                <div className="w-1/3 h-6 bg-white/10 rounded-md" />
                                <div className="w-full h-4 bg-white/5 rounded-md mt-4" />
                                <div className="w-5/6 h-4 bg-white/5 rounded-md" />
                                <div className="w-4/6 h-4 bg-white/5 rounded-md" />
                                <div className="mt-8 p-4 bg-darker/50 border border-white/5 rounded-lg border-l-2 border-l-purple-500 font-mono text-sm text-purple-300">
                    // Write code here...<br />
                                    const idea = "brilliant";<br />
                                    share(idea);
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex-center text-blue-400">
                                <Share2 size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">The Visual Feed</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Stop scrolling through boring text links. BLOQ space presents technical articles like visual art. High-fidelity cover images and engaging summaries make discovery addictive.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card flex flex-col relative z-10 transform -rotate-y-[10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 overflow-hidden shadow-2xl shadow-blue-500/10 border border-blue-500/20 group cursor-pointer">
                                {/* Cover Image */}
                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                    <img src="/feed-cover.png" alt="Code Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">10 min read</div>
                                </div>

                                <div className="p-6">
                                    {/* Author & Tags */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <img src="https://i.pravatar.cc/150?u=dev1" alt="Author" className="size-10 rounded-full border border-white/10" />
                                            <div>
                                                <div className="text-sm font-bold text-white">Alex Developer</div>
                                                <div className="text-xs text-gray-400">@alexdev • 2h ago</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">Building a High-Performance Rendering Engine in WebGL</h3>
                                    <p className="text-sm text-gray-400 mb-6 line-clamp-2">In this deep dive, we'll explore the architecture behind modern 3D rendering and how to squeeze every drop of performance out of WebGL using raw shaders.</p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 hover:text-pink-500 transition-colors">
                                                <Heart size={18} /> <span className="text-xs font-bold">128</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors">
                                                <MessageCircle size={18} /> <span className="text-xs font-bold">32</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <Bookmark size={18} className="hover:text-white transition-colors" />
                                            <Share2 size={18} className="hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-center text-emerald-400">
                                <Users size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Vibrant Community</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Build your professional brand. Engage with comments, like posts, and build a following of developers who care about your tech stack.
                            </p>
                        </div>
                        <div className="flex-1 w-full flex justify-center gap-4 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full" />

                            {/* Floating Avatars */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="size-16 rounded-full bg-white/10 border-2 border-[#0f0f11] shadow-xl absolute z-10 mix-blend-screen"
                                    style={{
                                        top: `${Math.random() * 200}px`,
                                        left: `${Math.random() * 80 + 10}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            ))}
                            <div className="glass-card p-6 w-full max-w-sm mt-20 relative z-0">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                                    <span className="text-white font-bold">Followers</span>
                                    <span className="text-emerald-400 font-mono text-xl">+124</span>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-white/10" />
                                                <div className="w-20 h-2 bg-white/10 rounded-full" />
                                            </div>
                                            <div className="h-6 w-16 rounded-full border border-white/20 flex-center text-[10px] text-gray-400">Follow</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="feature-card flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex-center text-indigo-400">
                                <GitFork size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Forkable Articles</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                The mechanics of open-source brought to writing. Fork any bloq, build upon someone else's brilliant ideas, and keep the pedigree alive with seamless attribution threading.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card p-6 flex flex-col gap-4 relative z-10 transform -rotate-y-[10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                                <div className="inline-flex px-3 py-1.5 bg-blue-600/20 rounded-full text-xs font-bold text-blue-400 items-center gap-1.5 border border-blue-500/20 w-max mb-2">
                                    <GitFork size={14} /> Forked from @Ancita
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-full bg-white/20" />
                                    <div>
                                        <div className="w-24 h-3 bg-white/20 rounded-full mb-2" />
                                        <div className="w-16 h-2 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                                <div className="w-full h-6 bg-white/10 rounded-md" />
                                <div className="w-3/4 h-4 bg-white/5 rounded-md" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 5 */}
                    <div className="feature-card flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex-center text-cyan-400">
                                <Code size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Live Code Blocks</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Stop sharing static screenshots. Inject fully interactive, instantly-compiling React and Javascript dev environments directly into your posts.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card overflow-hidden flex flex-col relative z-10 transform hover:-translate-y-2 transition-transform duration-500 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                                <div className="bg-[#0f0f11] px-4 py-3 text-xs font-mono text-cyan-400 border-b border-white/10 flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-cyan-500 animate-pulse" /> Live React Preview
                                </div>
                                <div className="flex flex-col sm:flex-row h-56 sm:h-48">
                                    <div className="w-full sm:w-1/2 p-4 bg-[#1a1a1a] sm:border-r border-b sm:border-b-0 border-white/5 font-mono text-xs text-white/70 space-y-2 overflow-hidden">
                                        <div><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> 'react';</div>
                                        <br />
                                        <div><span className="text-purple-400">export default function</span> <span className="text-blue-400">App</span>() {'{'}</div>
                                        <div className="pl-4"><span className="text-purple-400">return</span> <span className="text-cyan-400">&lt;h1&gt;</span>Hello World<span className="text-cyan-400">&lt;/h1&gt;</span>;</div>
                                        <div>{'}'}</div>
                                    </div>
                                    <div className="w-full sm:w-1/2 bg-white flex items-center justify-center p-4">
                                        <h1 className="text-black text-xl font-bold text-center">Hello World</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 6 */}
                    <div className="feature-card flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex-center text-fuchsia-400">
                                <Briefcase size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Project Collab Rooms</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Stop building alone. Post project requirements, recruit teammates, and launch into a dedicated workspace with real-time chat and Kanban task management.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card p-4 md:p-6 flex flex-col gap-4 relative z-10 transform rotate-y-[5deg] -rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                                {/* Dashboard Mockup Mini */}
                                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-full bg-red-500" />
                                        <div className="size-3 rounded-full bg-yellow-500" />
                                        <div className="size-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded">Collab Dashboard</div>
                                </div>

                                <div className="flex gap-2 md:gap-4 h-32">
                                    {/* Kanban Columns */}
                                    {['To Do', 'Building', 'Done'].map((col, idx) => (
                                        <div key={idx} className="flex-1 bg-black/40 rounded-lg p-2 border border-white/5 flex flex-col gap-2">
                                            <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase">{col}</div>
                                            {idx === 0 && <div className="h-8 bg-white/10 rounded border border-white/5" />}
                                            {idx === 1 && (
                                                <>
                                                    <div className="h-8 bg-white/10 rounded border border-white/5" />
                                                    <div className="h-8 bg-white/10 rounded border border-white/5" />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-8 bg-white/5 rounded-lg border border-white/5 flex items-center px-3 mt-2">
                                    <div className="size-4 rounded-full bg-white/20 mr-2 shrink-0" />
                                    <div className="h-2 w-24 md:w-32 bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 7 */}
                    <div className="feature-card flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="size-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex-center text-orange-400">
                                <Map size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Developer Radar</h2>
                            <p className="text-xl text-gray-400 font-paragraph">
                                Discover talent near you. Our interactive map lets you find developers in your city, explore their tech stack, and connect to collaborate locally.
                            </p>
                        </div>
                        <div className="flex-1 w-full relative perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent blur-3xl rounded-full" />
                            <div className="glass-card overflow-hidden relative z-10 transform -rotate-y-[5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 h-64 border border-orange-500/20 shadow-2xl shadow-orange-500/10 flex items-center justify-center">
                                {/* Fake Map Background */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/20 via-[#0f0f11] to-[#0f0f11] z-0" />
                                <div
                                    className="absolute inset-0 z-0 opacity-40 mix-blend-screen bg-center bg-cover scale-110"
                                    style={{ backgroundImage: 'url(/mumbai-map.png)' }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

                                {/* Mock Map Pins */}
                                <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-bounce" style={{ animationDelay: '0ms' }}>
                                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white border border-white/10 mb-1 whitespace-nowrap">
                                        React Developer
                                    </div>
                                    <MapPin size={24} className="text-orange-500 fill-orange-500/50" />
                                </div>
                                <div className="absolute top-1/2 right-1/4 flex flex-col items-center animate-bounce" style={{ animationDelay: '500ms' }}>
                                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white border border-white/10 mb-1 whitespace-nowrap">
                                        UI/UX Designer
                                    </div>
                                    <MapPin size={24} className="text-fuchsia-500 fill-fuchsia-500/50" />
                                </div>
                                <div className="absolute bottom-1/4 left-1/2 flex flex-col items-center animate-bounce" style={{ animationDelay: '1000ms' }}>
                                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white border border-white/10 mb-1 whitespace-nowrap">
                                        Backend Dev
                                    </div>
                                    <MapPin size={24} className="text-cyan-500 fill-cyan-500/50" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Final Call to Action */}
            <section className="final-section min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden py-32 px-6">
                <div className="absolute inset-0 bg-[#0f0f11]">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                <div className="relative z-10 text-center space-y-10 max-w-4xl mx-auto">
                    <h2 className="final-cta-text text-5xl md:text-7xl font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-tight">
                        Ready to claim your spot in the space?
                    </h2>
                    <Link to="/auth" className="btn-primary inline-flex items-center gap-2 text-xl scale-110">
                        Join BLOQ Today <ArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-8 text-center text-gray-500 text-sm font-paragraph">
                <p>&copy; 2026 BLOQ Space. Built for the modern developer.</p>
            </footer>
        </div>
    );
};

export default Landing;
