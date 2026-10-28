const fs = require("fs");
const path = require("path");
const git = require("isomorphic-git");

async function main() {
  const dir = path.resolve(__dirname, "..");
  console.log("Initializing Git repository at:", dir);

  await git.init({ fs, dir, defaultBranch: "main" });
  console.log("Git initialized on branch 'main'.");

  // Read all files recursively respecting .gitignore
  const filesToAdd = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(dir, fullPath).replace(/\\/g, "/");

      // Skip ignored paths
      if (
        relPath === ".git" ||
        relPath.startsWith(".git/") ||
        relPath === "node_modules" ||
        relPath.startsWith("node_modules/") ||
        relPath === ".next" ||
        relPath.startsWith(".next/") ||
        relPath === "dev.db" ||
        relPath === "dev.db-journal" ||
        relPath === ".env"
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        filesToAdd.push(relPath);
      }
    }
  }

  walk(dir);
  console.log(`Adding ${filesToAdd.length} files to Git index...`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: "AdScene Studio",
      email: "studio@adscene.com",
    },
    message: "feat: AdScene Studio Pro with Gemini Imagen 3 and Gmail Auth",
  });

  console.log("Committed successfully! Commit SHA:", sha);
}

main().catch((err) => {
  console.error("Git error:", err);
  process.exit(1);
});
