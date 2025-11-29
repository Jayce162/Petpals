import React, { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, BadgeCheck, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { PetProfile, SocialPost } from '../types';
import { useLanguage } from '../LanguageContext';
import { PLACEHOLDER_AVATAR, PLACEHOLDER_IMAGE } from '../constants';
import { generatePostCaption } from '../services/geminiService';

interface SocialFeedProps {
  posts: SocialPost[];
  currentUser: PetProfile;
  onAddPost: (post: SocialPost) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, currentUser, onAddPost }) => {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [newPostImage, setNewPostImage] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  
  // Interaction States
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<{postId: string, x: number, y: number}[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setNewPostImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAICaption = async () => {
      if (!newPostImage) return;
      setIsGeneratingCaption(true);
      const caption = await generatePostCaption(currentUser.name, "playing or being cute");
      setNewPostContent(caption);
      setIsGeneratingCaption(false);
  };

  const handleSubmitPost = () => {
      if (!newPostContent || !newPostImage) return;
      
      const newPost: SocialPost = {
          id: Date.now().toString(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorImage: currentUser.images[0],
          isVerified: currentUser.isVerified,
          content: newPostContent,
          image: newPostImage,
          likes: 0,
          comments: 0,
          timestamp: 'Just now'
      };
      
      onAddPost(newPost);
      setIsCreating(false);
      setNewPostContent('');
      setNewPostImage('');
  };

  const toggleLike = (postId: string) => {
      const newLiked = new Set(likedPosts);
      if (newLiked.has(postId)) {
          newLiked.delete(postId);
      } else {
          newLiked.add(postId);
      }
      setLikedPosts(newLiked);
  };

  const handleDoubleTap = (e: React.MouseEvent, postId: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add Heart Animation
      setAnimatingHearts(prev => [...prev, { postId, x, y }]);
      
      // Auto Like
      if (!likedPosts.has(postId)) {
          toggleLike(postId);
      }

      // Remove heart after animation
      setTimeout(() => {
          setAnimatingHearts(prev => prev.filter(h => h.postId !== postId));
      }, 800);
  };

  return (
    <div className="w-full h-full bg-gray-50 pb-20 overflow-y-auto relative">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black tracking-tight text-gray-900">{t('feed.title')}</h1>
        <div className="w-8"></div> {/* Balancer */}
      </div>

      <div className="flex flex-col gap-4 p-4">
        {posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            return (
              <div key={post.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                        src={post.authorImage} 
                        alt={post.authorName} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                        />
                        {post.isVerified && <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5"><BadgeCheck size={14} className="text-blue-500 fill-white" /></div>}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        {post.authorName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">{post.timestamp}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Content Text */}
                <p className="text-gray-700 mb-3 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {post.content}
                </p>

                {/* Image Area with Double Tap */}
                {post.image && (
                  <div 
                    className="relative mb-3 rounded-2xl overflow-hidden border border-gray-100 aspect-square group cursor-pointer"
                    onDoubleClick={(e) => handleDoubleTap(e, post.id)}
                  >
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    
                    {/* Pop-up Hearts */}
                    {animatingHearts.filter(h => h.postId === post.id).map((heart, i) => (
                        <div 
                            key={i} 
                            className="absolute pointer-events-none animate-like-heart-pop"
                            style={{ left: heart.x - 40, top: heart.y - 40 }}
                        >
                            <Heart size={80} className="fill-white text-white drop-shadow-xl" />
                        </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-2 px-1">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                    <span className="text-sm font-bold">{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-all active:scale-90">
                    <MessageCircle size={24} />
                    <span className="text-sm font-bold">{post.comments}</span>
                  </button>
                  <button className="text-gray-400 hover:text-green-500 transition-all ml-auto active:scale-90">
                    <Send size={22} />
                  </button>
                </div>
              </div>
            );
        })}
      </div>

      {/* Floating Action Button (FAB) for Create Post */}
      <button 
        onClick={() => setIsCreating(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-coral-500 to-orange-400 rounded-full shadow-lg shadow-coral-200 text-white flex items-center justify-center z-40 transform transition-all hover:scale-110 active:scale-90"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Create Post Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-gray-900">New Post</h2>
                      <button onClick={() => setIsCreating(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {!newPostImage ? (
                       <div className="w-full h-56 bg-gray-50 border-2 border-dashed border-coral-200 rounded-3xl flex flex-col items-center justify-center mb-6 relative hover:bg-coral-50/30 transition-colors cursor-pointer group">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <Plus size={32} className="text-coral-400" />
                           </div>
                           <span className="text-gray-500 font-bold text-sm">Add Photo</span>
                           <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                  ) : (
                       <div className="relative mb-6 group">
                           <img src={newPostImage} className="w-full h-64 object-cover rounded-3xl shadow-md" alt="Preview" />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-3xl" />
                           <button onClick={() => setNewPostImage('')} className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-md transition-colors">
                               <X size={16} />
                           </button>
                           <button 
                              onClick={handleAICaption}
                              disabled={isGeneratingCaption}
                              className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-purple-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
                           >
                               {isGeneratingCaption ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                               AI Magic Caption
                           </button>
                       </div>
                  )}

                  <textarea 
                      value={newPostContent} 
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Write something pawesome..."
                      className="w-full bg-gray-50 rounded-2xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-coral-200 text-gray-800 placeholder-gray-400 font-medium resize-none"
                      rows={3}
                  />

                  <button 
                      onClick={handleSubmitPost}
                      disabled={!newPostImage || !newPostContent}
                      className="w-full py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-coral-200 hover:shadow-coral-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                  >
                      Share Post
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};