import { type User, type InsertUser, type Entry, type InsertEntry } from "@shared/schema";
import { User as UserModel, Entry as EntryModel, connectDB } from "./db";
import type { Document } from "mongoose";

// Storage interface with CRUD methods for Users and Entries
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Entry methods
  getEntry(id: string): Promise<Entry | null>;
  getEntriesByUserId(userId: string): Promise<Entry[]>;
  getAllEntries(limit?: number): Promise<Entry[]>;
  searchEntries(userId: string, query: string): Promise<Entry[]>;
  createEntry(entry: InsertEntry): Promise<Entry>;
  updateEntry(id: string, userId: string, updates: Partial<InsertEntry>): Promise<Entry | null>;
  deleteEntry(id: string, userId: string): Promise<boolean>;
}

// MongoDB Storage Implementation
export class MongoStorage implements IStorage {
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // Don't connect immediately - wait for first operation
  }

  private async ensureConnection() {
    if (!this.connectionPromise) {
      console.log("[Storage] Initiating MongoDB connection...");
      this.connectionPromise = connectDB().catch((error) => {
        console.error("[Storage] Failed to connect to MongoDB:", error.message);
        console.error("[Storage] Error details:", error);
        this.connectionPromise = null; // Reset on error to allow retry
        throw error;
      });
    }
    await this.connectionPromise;
    console.log("[Storage] MongoDB connection ready");
  }

  // Helper to convert Mongoose document to plain object
  private toPlainObject<T>(doc: Document | null): T | null {
    if (!doc) return null;
    const obj = doc.toObject();
    // Convert userId to string if it's an ObjectId
    const userId = obj.userId?.toString ? obj.userId.toString() : obj.userId;
    return {
      ...obj,
      id: obj._id.toString(),
      userId: userId,
      _id: undefined,
      __v: undefined,
    } as T;
  }

  // User Methods
  async getUser(id: string): Promise<User | null> {
    await this.ensureConnection();
    const user = await UserModel.findById(id).select("-__v");
    return this.toPlainObject<User>(user);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    await this.ensureConnection();
    const user = await UserModel.findOne({ username }).select("-__v");
    return this.toPlainObject<User>(user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnection();
    const user = await UserModel.create(insertUser);
    return this.toPlainObject<User>(user)!;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    await this.ensureConnection();
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");
    return this.toPlainObject<User>(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Entry Methods
  async getEntry(id: string): Promise<Entry | null> {
    await this.ensureConnection();
    const entry = await EntryModel.findById(id).select("-__v");
    return this.toPlainObject<Entry>(entry);
  }

  async getEntriesByUserId(userId: string): Promise<Entry[]> {
    await this.ensureConnection();
    // Import mongoose for ObjectId conversion
    const mongoose = await import('mongoose');
    // Query with both string and ObjectId to handle mixed data
    const entries = await EntryModel.find({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) }
      ]
    })
      .sort({ createdAt: -1 })
      .select("-__v");
    return entries.map(entry => this.toPlainObject<Entry>(entry)!);
  }

  async getAllEntries(limit: number = 50): Promise<Entry[]> {
    await this.ensureConnection();
    const entries = await EntryModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-__v");
    return entries.map(entry => this.toPlainObject<Entry>(entry)!);
  }

  async searchEntries(userId: string, query: string): Promise<Entry[]> {
    await this.ensureConnection();
    const mongoose = await import('mongoose');
    const entries = await EntryModel.find({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) }
      ],
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .select("-__v");
    return entries.map(entry => this.toPlainObject<Entry>(entry)!);
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    await this.ensureConnection();
    const entry = await EntryModel.create(insertEntry);
    return this.toPlainObject<Entry>(entry)!;
  }

  async updateEntry(id: string, userId: string, updates: Partial<InsertEntry>): Promise<Entry | null> {
    await this.ensureConnection();
    const mongoose = await import('mongoose');
    // Ensure user can only update their own entries - check both string and ObjectId
    const entry = await EntryModel.findOneAndUpdate(
      { 
        _id: id,
        $or: [
          { userId: userId },
          { userId: new mongoose.Types.ObjectId(userId) }
        ]
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");
    return this.toPlainObject<Entry>(entry);
  }

  async deleteEntry(id: string, userId: string): Promise<boolean> {
    await this.ensureConnection();
    const mongoose = await import('mongoose');
    // Ensure user can only delete their own entries - check both string and ObjectId
    const result = await EntryModel.findOneAndDelete({ 
      _id: id,
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) }
      ]
    });
    return result !== null;
  }
}

export const storage = new MongoStorage();
