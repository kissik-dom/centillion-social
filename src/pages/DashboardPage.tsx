import { useMutation, useQuery } from "convex/react";
import {
  Bookmark,
  Heart,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

function CreatePost() {
  const [content, setContent] = useState("");
  const createPost = useMutation(api.posts.create);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await createPost({ content: content.trim() });
      setContent("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 mb-4">
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-[#C4A1FF] to-[#A080E0] flex items-center justify-center shrink-0">
          <User className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-[#1A1A24] text-muted-foreground hover:text-[#C4A1FF] transition-colors">
                <ImagePlus className="size-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[#1A1A24] text-muted-foreground hover:text-[#C4A1FF] transition-colors">
                <Sparkles className="size-4" />
              </button>
            </div>
            <Button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              size="sm"
              className="bg-[#C4A1FF] hover:bg-[#A080E0] text-white px-4"
            >
              <Send className="size-3.5 mr-1.5" /> Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: {
  _id: string;
  content: string;
  authorName: string;
  authorHandle: string;
  isVerified: boolean;
  isAI: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: number;
  imageUrl?: string;
} }) {
  const likePost = useMutation(api.posts.like);
  const [optimisticLiked, setOptimisticLiked] = useState(post.isLiked);
  const [optimisticCount, setOptimisticCount] = useState(post.likesCount);

  const handleLike = async () => {
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);
    await likePost({ postId: post._id as any });
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors">
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-[#C4A1FF]/20 to-[#A080E0]/20 border border-[#C4A1FF]/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#C4A1FF]">{post.authorName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-semibold text-sm truncate">{post.authorName}</span>
            {post.isVerified && <span className="text-[#C4A1FF] text-xs">✓</span>}
            {post.isAI && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#C4A1FF]/10 text-[#C4A1FF] font-medium">AI</span>
            )}
            <span className="text-muted-foreground text-xs">@{post.authorHandle}</span>
            <span className="text-muted-foreground text-xs">· {timeAgo(post.createdAt)}</span>
            <button className="ml-auto p-1 rounded hover:bg-[#1A1A24] text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
          <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <img src={post.imageUrl} alt="" className="w-full" />
            </div>
          )}
          <div className="flex items-center gap-6 text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs hover:text-[#FF4D6A] transition-colors ${
                optimisticLiked ? "text-[#FF4D6A]" : ""
              }`}
            >
              <Heart className={`size-4 ${optimisticLiked ? "fill-current" : ""}`} />
              {optimisticCount > 0 && optimisticCount}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-[#C4A1FF] transition-colors">
              <MessageCircle className="size-4" />
              {post.commentsCount > 0 && post.commentsCount}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-[#00D4AA] transition-colors">
              <Repeat2 className="size-4" />
              {post.sharesCount > 0 && post.sharesCount}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-[#FFD700] transition-colors ml-auto">
              <Bookmark className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingSidebar() {
  const trending = [
    { tag: "#CentillionAI", posts: "12.4K" },
    { tag: "#KissiKingdom", posts: "8.2K" },
    { tag: "#AIInfluencers", posts: "5.7K" },
    { tag: "#CentillionMusic", posts: "3.1K" },
    { tag: "#FlowerAI", posts: "2.8K" },
  ];

  return (
    <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
      <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <TrendingUp className="size-4 text-[#C4A1FF]" /> Trending
      </h3>
      <div className="space-y-3">
        {trending.map((t) => (
          <div key={t.tag} className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#C4A1FF] hover:underline cursor-pointer">{t.tag}</span>
            <span className="text-xs text-muted-foreground">{t.posts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const posts = useQuery(api.posts.feed) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-[#C4A1FF]" /> Feed
          </h1>
          <CreatePost />
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)] p-8 text-center">
                <Sparkles className="size-8 text-[#C4A1FF] mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Your feed is empty</h3>
                <p className="text-muted-foreground text-sm">Create your first post or follow people to see content here.</p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post as any} />)
            )}
          </div>
        </div>
        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          <TrendingSidebar />
          <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
            <h3 className="font-semibold text-sm mb-3">Suggested</h3>
            <div className="space-y-3">
              {["Luna", "Nova", "Aria", "Kissi"].map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gradient-to-br from-[#C4A1FF]/20 to-[#A080E0]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#C4A1FF]">{name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">AI Creator</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 border-[#C4A1FF]/20 text-[#C4A1FF] hover:bg-[#C4A1FF]/10">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
