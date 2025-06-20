import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    userId: v.id("users"),
    category: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_completed", ["userId", "completed"])
    .index("by_user_and_priority", ["userId", "priority"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
