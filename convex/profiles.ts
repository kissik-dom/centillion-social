import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (profile) return profile;
    // Return default profile shape
    const user = await ctx.db.get(userId);
    return {
      _id: null,
      userId,
      displayName: user?.name || "User",
      handle: user?.email?.split("@")[0] || "user",
      bio: "",
      avatarUrl: undefined,
      coverUrl: undefined,
      followersCount: 0,
      followingCount: 0,
      isVerified: false,
      isAI: false,
      createdAt: Date.now(),
    };
  },
});

export const createOrUpdate = mutation({
  args: {
    displayName: v.string(),
    handle: v.string(),
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("profiles", {
        userId,
        ...args,
        avatarUrl: undefined,
        coverUrl: undefined,
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        isAI: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const trending = query({
  args: {},
  handler: async (ctx) => {
    // Return some profiles for the trending section
    const profiles = await ctx.db
      .query("profiles")
      .order("desc")
      .take(10);
    return profiles;
  },
});
