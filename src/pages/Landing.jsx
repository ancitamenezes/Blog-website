import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { ArrowRight, PenTool, Share2, Users } from "lucide-react";

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
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_50%)]" />

                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    <h1 className="hero-title text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-white flex flex-wrap justify-center gap-x-4 uppercase">
                        <span>Code.</span>
                        <span>Create.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Connect.</span>
                    </h1>

                    <p className="hero-subtitle mt-8 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-paragraph leading-relaxed">
                        The premium social space for developers. Share your journey, write high-quality technical blogs, and connect with the top 1% of builders.
                    </p>

                    <div className="hero-cta mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/auth" className="btn-primary flex items-center gap-2 group text-lg">
                            Start Writing <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/feed" className="btn-secondary text-lg">
                            Explore Feed
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-pulse">
                    <span className="text-sm uppercase tracking-widest font-bold">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
                </div>
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
                            <div className="glass-card flex flex-col gap-4 relative z-10 transform -rotate-y-[10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                                <div className="h-48 rounded-t-2xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80" />
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-white/20" />
                                        <div>
                                            <div className="w-24 h-3 bg-white/20 rounded-full mb-2" />
                                            <div className="w-16 h-2 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="w-full h-6 bg-white/10 rounded-md" />
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
