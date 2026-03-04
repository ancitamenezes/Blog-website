import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Image as ImageIcon, Link as LinkIcon, Hash, Send, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const CreatePost = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fileInputRef = useRef(null);

    useGSAP(() => {
        gsap.from('.editor-container', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        });
    });

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !user) return;

        setLoading(true);
        setErrorMsg('');

        try {
            let cover_image_url = null;

            // Upload image to Supabase Storage if one was selected
            if (coverImage) {
                const fileExt = coverImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(filePath, coverImage);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: publicUrlData } = supabase.storage
                    .from('covers')
                    .getPublicUrl(filePath);

                cover_image_url = publicUrlData.publicUrl;
            }

            // Insert post into database
            const { error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    title,
                    content,
                    cover_image: cover_image_url
                });

            if (insertError) throw insertError;

            navigate('/feed');
        } catch (error) {
            console.error("Error creating post:", error);
            setErrorMsg(error.message || "Failed to publish post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 font-sans min-h-[80vh]">
            <div className="editor-container glass-card p-8 md:p-12 relative overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute -top-40 -right-40 size-80 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full space-y-8">

                    {/* Title Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Title of your Bloq..."
                            className="w-full bg-transparent text-4xl md:text-5xl font-bold tracking-tight text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 border-none px-0 py-4"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Image Preview */}
                    {previewUrl && (
                        <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                            <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={() => { setCoverImage(null); setPreviewUrl(''); }}
                                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center gap-2 border-y border-white/5 py-3">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors tooltip relative group"
                            title="Add Cover Image"
                        >
                            <ImageIcon size={20} />
                        </button>
                        <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <LinkIcon size={20} />
                        </button>
                        <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <Hash size={20} />
                        </button>

                        <div className="flex-1" />
                        <span className="text-xs text-gray-500 font-mono hidden sm:block">Markdown Supported</span>
                    </div>

                    {/* Content Editor */}
                    <div className="flex-1 min-h-[300px]">
                        <textarea
                            placeholder="Write your brilliant thoughts here. Tell a story, share some code..."
                            className="w-full h-full min-h-[300px] bg-transparent text-lg md:text-xl text-gray-300 font-paragraph placeholder:text-gray-600 focus:outline-none resize-none leading-relaxed"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex gap-4 text-sm text-gray-500">
                            <button type="button" className="hover:text-white transition-colors">Save Draft</button>
                            <button type="button" className="hover:text-white transition-colors">Preview</button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary flex items-center justify-center gap-2 px-8 py-3 mt-0 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                            disabled={!title || !content || loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Publish Bloq</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
