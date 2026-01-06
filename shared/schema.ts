import { z } from "zod";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().url().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  profileImage: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Journal Entry schemas
export const insertEntrySchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  coordinates: z.tuple([
    z.number().min(-90).max(90), // latitude
    z.number().min(-180).max(180) // longitude
  ]),
  date: z.string().or(z.date()),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string().url()).max(3, "Maximum 3 images allowed").default([]),
});

export const entrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  location: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  date: z.string().or(z.date()),
  description: z.string(),
  images: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = z.infer<typeof entrySchema>;
