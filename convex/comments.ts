import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .take(50);
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", c.authorId))
          .first();
        return {
          ...c,
          authorName: profile?.displayName || author?.name || "User",
          authorHandle: profile?.handle || "user",
        };
      })
    );
    return enriched;
  },
});

export const add = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    const id = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      content: args.content,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.postId, { commentsCount: post.commentsCount + 1 });
    return id;
  },
});
