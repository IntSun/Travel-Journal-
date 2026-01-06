// Vercel serverless function handler
// This file will be copied to the function directory and act as the entry point

import type { Request, Response } from "express";

// Import the main app
import app from "./index";

// Export for Vercel
export default app;

// Also export as module.exports for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

