import { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { supabase, hasValidSupabaseKeys } from '../lib/supabase';
import { Send, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamChatProps {
  user: User;
}

export default function TeamChat({ user }: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasValidSupabaseKeys) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          senderId: d.sender_id,
          senderName: d.sender_name,
          senderRole: d.sender_role,
          receiverRole: d.receiver_role,
          content: d.content,
          createdAt: d.created_at
        }));
        setMessages(formatted);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const d = payload.new;
        setMessages(prev => [...prev, {
          id: d.id,
          senderId: d.sender_id,
          senderName: d.sender_name,
          senderRole: d.sender_role,
          receiverRole: d.receiver_role,
          content: d.content,
          createdAt: d.created_at
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!hasValidSupabaseKeys) {
      // Mock mode
      const msg: Message = {
        id: Math.random().toString(),
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverRole: 'all',
        content: newMessage,
        createdAt: new Date().toISOString()
      };
      setMessages([...messages, msg]);
      setNewMessage('');
      return;
    }

    setIsLoading(true);
    try {
      await supabase.from('messages').insert({
        id: `MSG-${Math.floor(Math.random() * 1000000)}`,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        receiver_role: 'all',
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 font-display flex items-center gap-2">
          <UserIcon size={18} className="text-brand-500" /> 
          Team Communication (Admin, Staff, Riders)
        </h3>
        <p className="text-xs text-slate-500 mt-1">Communicate regarding pickups, orders, and operations.</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user.id;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || i} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500">{isMe ? 'You' : msg.senderName}</span>
                  {!isMe && <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{msg.senderRole}</span>}
                </div>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                  isMe ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !newMessage.trim()}
          className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
