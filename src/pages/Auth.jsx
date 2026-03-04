import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Github, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Auth = () => {
    const { fetchUserProfile } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        gsap.fromTo('.auth-panel',
            { x: isLogin ? 50 : -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
        setErrorMsg(""); // Clear errors when switching modes
    }, [isLogin]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isLogin) {
                // Handle Login
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/feed');
            } else {
                // Handle Sign Up
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (authError) throw authError;

                if (authData.user) {
                    // Create user profile in public table
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            username: username,
                            name: username, // default name to username
                            avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random` // generate random avatar
                        });

                    if (profileError) throw profileError;

                    // Fetch the profile synchronously to populate the React context BEFORE we redirect
                    await fetchUserProfile(authData.user.id);

                    // Supabase auto-logins on signup if email confirmation is off. 
                    navigate('/feed');
                }
            }
        } catch (error) {
            setErrorMsg(error.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
            });
            if (error) throw error;
        } catch (error) {
            setErrorMsg(error.message);
        }
    }

    return (
        <div className="min-h-screen bg-[#0f0f11] flex font-sans text-white">
            {/* Visual Side (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-darker items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.2)_0%,transparent_50%)]" />

                {/* Animated Abstract Shapes */}
                <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
                    <div className="absolute size-96 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 blur-3xl opacity-20 animate-pulse" />
                    <div className="glass-card w-96 h-[500px] border-white/10 p-8 transform rotate-y-[-15deg] rotate-x-[10deg] flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10" />
                            <div className="w-2/3 h-6 rounded-md bg-white/20" />
                            <div className="w-full h-4 rounded-md bg-white/5" />
                            <div className="w-5/6 h-4 rounded-md bg-white/5" />
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <div className="w-1/3 h-4 rounded-md bg-white/10" />
                            <div className="w-12 h-8 rounded-full bg-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col relative px-8 py-12 md:px-16 lg:px-24 justify-center">
                <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft size={20} /> Back
                </Link>

                <div className="auth-panel max-w-md w-full mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter uppercase">
                            {isLogin ? 'Welcome Back' : 'Join BLOQ'}
                        </h1>
                        <p className="text-gray-400 font-paragraph">
                            {isLogin
                                ? 'Enter your details to access your feed.'
                                : 'Create an account to start writing and sharing.'}
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="glass-input w-full pl-12"
                                    required={!isLogin}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full pl-12"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full pl-12 pr-12"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full text-lg mt-4 shadow-none hover:shadow-[0_0_20px_var(--color-primary-glow)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR CONTINUE WITH</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button
                        onClick={handleGithubLogin}
                        disabled={loading}
                        className="btn-secondary w-full flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Github size={20} /> GitHub
                    </button>

                    <p className="text-center text-gray-400 mt-8 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/50 underline-offset-4"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
