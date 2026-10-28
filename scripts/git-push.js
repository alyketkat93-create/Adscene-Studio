const fs = require("fs");
const path = require("path");
const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");

async function pushToGitHub(remoteUrl, token) {
  const dir = path.resolve(__dirname, "..");
  console.log(`Setting remote origin: ${remoteUrl}`);

  try {
    await git.removeRemote({ fs, dir, remote: "origin" });
  } catch {
    // remote didn't exist
  }

  await git.addRemote({ fs, dir, remote: "origin", url: remoteUrl });

  console.log("Pushing to GitHub branch 'main'...");
  const result = await git.push({
    fs,
    http,
    dir,
    remote: "origin",
    ref: "main",
    onAuth: () => ({ username: token, password: "" }),
  });

  console.log("Push completed successfully!", result);
}

// Read args if provided: node scripts/git-push.js <repo-url> <token>
const [repoUrl, token] = process.argv.slice(2);
if (repoUrl && token) {
  pushToGitHub(repoUrl, token).catch((e) => {
    console.error("Push failed:", e);
    process.exit(1);
  });
} else {
  module.exports = { pushToGitHub };
}
