import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const feed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_time")
      .order("desc")
      .take(50);

    // Enrich with author info
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .first();
        const liked = await ctx.db
          .query("likes")
          .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", post._id))
          .first();
        return {
          ...post,
          authorName: profile?.displayName || author?.name || "User",
          authorHandle: profile?.handle || "user",
          authorAvatar: profile?.avatarUrl,
          isVerified: profile?.isVerified || false,
          isAI: profile?.isAI || false,
          isLiked: !!liked,
        };
      })
    );
    return enriched;
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("posts", {
      authorId: userId,
      content: args.content,
      imageUrl: args.imageUrl,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const like = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", args.postId))
      .first();
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likesCount: Math.max(0, post.likesCount - 1) });
    } else {
      await ctx.db.insert("likes", { userId, postId: args.postId, createdAt: Date.now() });
      await ctx.db.patch(args.postId, { likesCount: post.likesCount + 1 });
    }
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== userId) throw new Error("Not authorized");
    // Delete related likes and comments
    const likes = await ctx.db.query("likes").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
    for (const l of likes) await ctx.db.delete(l._id);
    const comments = await ctx.db.query("comments").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
    for (const c of comments) await ctx.db.delete(c._id);
    await ctx.db.delete(args.postId);
  },
});
