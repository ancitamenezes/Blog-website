import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { MessageCircle, Send, Search, Loader2 } from 'lucide-react';

const Messages = () => {
    const { user, following } = useAppContext();
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Fetch contacts (people you follow)
    useEffect(() => {
        const fetchContacts = async () => {
            if (!user || !following || following.length === 0) {
                setLoadingContacts(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, username, avatar_url')
                    .in('id', following);

                if (error) throw error;

                // Map avatar_url
                const formattedData = data.map(d => ({ ...d, avatar: d.avatar_url }));
                setContacts(formattedData);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoadingContacts(false);
            }
        };

        fetchContacts();
    }, [user, following]);

    // Fetch messages when a contact is selected
    useEffect(() => {
        if (!user || !activeContact) return;

        const fetchChat = async () => {
            setLoadingMessages(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchChat();

        // Subscribe to real-time inserts for the active chat
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new;
                    // Only add if it belongs to the current conversation
                    if (
                        (newMsg.sender_id === user.id && newMsg.receiver_id === activeContact.id) ||
                        (newMsg.sender_id === activeContact.id && newMsg.receiver_id === user.id)
                    ) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, activeContact]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !activeContact) return;

        const msgContent = newMessage;
        setNewMessage('');
        setIsSending(true);

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: activeContact.id,
                    content: msgContent
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] md:h-screen flex text-white relative">
            {/* Left Pane: Contacts List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-[#0a0a0c] ${activeContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold tracking-tight mb-4 text-white">Direct Messages</h2>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="glass-input w-full pl-10 !py-2 !rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex justify-center p-6 text-gray-500">
                            <Loader2 className="animate-spin" size={24} />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 border border-white/5 m-4 rounded-xl glass-card">
                            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">You aren't following anyone yet.</p>
                            <p className="text-xs mt-1">Follow creators to send them a message.</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {contacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveContact(contact)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeContact?.id === contact.id ? 'bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5'}`}
                                >
                                    <div className="relative">
                                        <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full border border-white/10" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">{contact.name}</h3>
                                        <p className="text-gray-500 text-xs truncate">@{contact.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#0f0f11] ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-white/5 flex items-center px-6 gap-4 bg-[#0a0a0c]/50 backdrop-blur-md">
                            <button
                                className="md:hidden text-gray-400 hover:text-white"
                                onClick={() => setActiveContact(null)}
                            >
                                ←
                            </button>
                            <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                                <h3 className="font-bold text-white">{activeContact.name}</h3>
                                <p className="text-xs text-primary">@{activeContact.username}</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center flex-1 h-full items-center text-primary">
                                    <Loader2 className="animate-spin" size={32} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <MessageCircle size={24} />
                                    </div>
                                    <p className="font-medium text-white mb-1">Say Hello to {activeContact.name}!</p>
                                    <p className="text-sm max-w-sm">This is the beginning of your direct message history with @{activeContact.username}.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className="flex flex-col gap-1 max-w-[70%]">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl text-sm ${isMe
                                                            ? 'bg-primary text-white rounded-br-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)]'
                                                            : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className={`text-[10px] text-gray-500 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-[#0a0a0c] border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message @${activeContact.username}...`}
                                    className="glass-input w-full !py-3 !pl-4 !pr-12 !rounded-full bg-white/5 focus:bg-white/10 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="absolute right-2 p-2 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} className="ml-0.5" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MessageCircle size={40} className="text-primary opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
                        <p className="max-w-md text-center">Select a contact from the sidebar to start a conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
