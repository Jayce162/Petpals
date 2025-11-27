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

  return (
    <div className="w-full h-full bg-white pb-20 overflow-y-auto relative">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center">
        <div className="w-8" /> {/* Spacer */}
        <h1 className="text-xl font-bold text-center">{t('feed.title')}</h1>
        <button 
            onClick={() => setIsCreating(true)}
            className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition"
        >
            <Plus size={20} />
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <div key={post.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={post.authorImage} 
                  alt={post.authorName} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                />
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1">
                    {post.authorName}
                    {post.isVerified && <BadgeCheck size={14} className="text-white fill-blue-500" />}
                  </h3>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
              </div>
              <button className="text-gray-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <p className="text-gray-800 mb-3 text-sm leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {post.image && (
              <div className="mb-3 rounded-xl overflow-hidden border border-gray-100">
                <img 
                  src={post.image} 
                  alt="Post content" 
                  className="w-full object-cover" 
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
                />
              </div>
            )}

            <div className="flex items-center gap-6 mt-2">
              <button className="flex items-center gap-2 text-gray-600 hover:text-coral-500 transition">
                <Heart size={20} />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                <MessageCircle size={20} />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="text-gray-600 hover:text-green-500 transition ml-auto">
                <Send size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold">New Post</h2>
                      <button onClick={() => setIsCreating(false)} className="p-2 bg-gray-100 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {!newPostImage ? (
                       <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center mb-4 relative">
                           <Plus size={32} className="text-gray-400 mb-2" />
                           <span className="text-gray-500 font-medium">Add Photo</span>
                           <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                  ) : (
                       <div className="relative mb-4">
                           <img src={newPostImage} className="w-full h-48 object-cover rounded-2xl" alt="Preview" />
                           <button onClick={() => setNewPostImage('')} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                               <X size={16} />
                           </button>
                           <button 
                              onClick={handleAICaption}
                              disabled={isGeneratingCaption}
                              className="absolute bottom-2 right-2 bg-white/90 text-purple-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
                           >
                               {isGeneratingCaption ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                               AI Caption
                           </button>
                       </div>
                  )}

                  <textarea 
                      value={newPostContent} 
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Write a caption..."
                      className="w-full bg-gray-50 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-coral-100"
                      rows={3}
                  />

                  <button 
                      onClick={handleSubmitPost}
                      disabled={!newPostImage || !newPostContent}
                      className="w-full py-3 bg-coral-500 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                      Post
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
