import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to get authenticated user
async function getAuthenticatedUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User must be authenticated");
  }
  return userId;
}

// Query to get all tasks for the authenticated user
export const getTasks = query({
  args: {
    filter: v.optional(v.union(v.literal("all"), v.literal("completed"), v.literal("pending"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    let query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Apply completion filter
    if (args.filter === "completed") {
      query = ctx.db
        .query("tasks")
        .withIndex("by_user_and_completed", (q) => 
          q.eq("userId", userId).eq("completed", true)
        );
    } else if (args.filter === "pending") {
      query = ctx.db
        .query("tasks")
        .withIndex("by_user_and_completed", (q) => 
          q.eq("userId", userId).eq("completed", false)
        );
    }

    const tasks = await query.collect();

    // Filter by category if specified
    if (args.category) {
      return tasks.filter(task => task.category === args.category);
    }

    return tasks.sort((a, b) => {
      // Sort by priority (high -> medium -> low) then by creation time
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b._creationTime - a._creationTime;
    });
  },
});

// Mutation to create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    if (!args.title.trim()) {
      throw new Error("Task title cannot be empty");
    }

    return await ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim(),
      completed: false,
      priority: args.priority,
      dueDate: args.dueDate,
      userId,
      category: args.category?.trim(),
    });
  },
});

// Mutation to update a task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (task.userId !== userId) {
      throw new Error("Unauthorized: You can only update your own tasks");
    }

    const updates: any = {};
    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Task title cannot be empty");
      }
      updates.title = args.title.trim();
    }
    if (args.description !== undefined) updates.description = args.description?.trim();
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.category !== undefined) updates.category = args.category?.trim();

    await ctx.db.patch(args.id, updates);
  },
});

// Mutation to toggle task completion
export const toggleTaskCompletion = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (task.userId !== userId) {
      throw new Error("Unauthorized: You can only update your own tasks");
    }

    await ctx.db.patch(args.id, {
      completed: !task.completed,
    });
  },
});

// Mutation to delete a task
export const deleteTask = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (task.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own tasks");
    }

    await ctx.db.delete(args.id);
  },
});

// Query to get task statistics
export const getTaskStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const completed = allTasks.filter(task => task.completed).length;
    const pending = allTasks.filter(task => !task.completed).length;
    const overdue = allTasks.filter(task => 
      !task.completed && task.dueDate && task.dueDate < Date.now()
    ).length;

    const categories = [...new Set(allTasks.map(task => task.category).filter(Boolean))] as string[];

    return {
      total: allTasks.length,
      completed,
      pending,
      overdue,
      categories,
    };
  },
});
