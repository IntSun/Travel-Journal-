import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, writeFile, cp } from "fs/promises";
import { join } from "path";

// server deps to bundle to reduce openat(2) syscalls
const allowlist = [
  "@google/generative-ai",
  "axios",
  "cors",
  "date-fns",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "mongoose",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  console.log("Starting Vercel build...");
  
  // Clean dist
  await rm("dist", { recursive: true, force: true });
  await rm(".vercel/output", { recursive: true, force: true });

  console.log("Building client...");
  await viteBuild();

  console.log("Building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("Creating Vercel output structure...");
  
  // Create .vercel/output directory structure
  await mkdir(".vercel/output/functions/api.func", { recursive: true });
  await mkdir(".vercel/output/static", { recursive: true });

  // Copy static files
  await cp("dist/public", ".vercel/output/static", { recursive: true });

  // Copy server function
  await cp("dist/index.cjs", ".vercel/output/functions/api.func/index.js");

  // Create package.json for the function (needed for dependencies)
  const functionPackage = {
    type: "commonjs"
  };
  
  await writeFile(
    ".vercel/output/functions/api.func/package.json",
    JSON.stringify(functionPackage, null, 2)
  );

  // Create function config
  const functionConfig = {
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
    supportsResponseStreaming: true
  };
  
  await writeFile(
    ".vercel/output/functions/api.func/.vc-config.json",
    JSON.stringify(functionConfig, null, 2)
  );

  // Create config.json for Vercel Build Output API
  const config = {
    version: 3,
    routes: [
      {
        src: "^/api/(.*)$",
        dest: "/api"
      },
      {
        handle: "filesystem"
      },
      {
        src: "^/(.*)$",
        dest: "/index.html"
      }
    ]
  };

  await writeFile(
    ".vercel/output/config.json",
    JSON.stringify(config, null, 2)
  );

  console.log("✓ Vercel build completed successfully!");
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

