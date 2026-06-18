// src/scripts/ci-safety-check.js
const { execSync } = require("child_process");

console.log("[CI Safety Check] Verifying that no application source code files have been modified...");

const allowedDirs = [
  "src/data/generated/",
  "src/data/cache/",
  "src/data/raw/",
  "src/data/reports/",
  "docs/generated/",
  "src/docs/generated/"
];

try {
  const statusOutput = execSync("git status --porcelain", { encoding: "utf8" });
  if (!statusOutput.trim()) {
    console.log("[CI Safety Check] No changes detected. Safety check PASSED.");
    process.exit(0);
  }

  const lines = statusOutput.split(/\r?\n/);
  const violations = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const rawPath = line.substring(3).trim();
    let filePaths = [rawPath];
    if (rawPath.includes(" -> ")) {
      filePaths = rawPath.split(" -> ").map(p => p.trim());
    }
    
    // Check if all parts of the file path (source and target if renamed) are in allowed directories
    const isAllowed = filePaths.every(fp => allowedDirs.some(dir => fp.startsWith(dir)));
    
    if (!isAllowed) {
      violations.push(rawPath);
    }
  }

  if (violations.length > 0) {
    console.error("\n========================================================");
    console.error("❌ CI SAFETY CHECK FAILED: FORBIDDEN FILES DETECTED!");
    console.error("The workflow attempted to modify application source code.");
    console.error("Only data/generated/**, data/cache/**, and docs/generated/** are mutable.");
    console.error("--------------------------------------------------------");
    console.error("Violating files:");
    violations.forEach(file => console.error(`  - ${file}`));
    console.error("========================================================\n");
    process.exit(1);
  }

  console.log("[CI Safety Check] All changes are inside approved generated-data directories. Safety check PASSED.");
  process.exit(0);

} catch (error) {
  console.error("[CI Safety Check] Error running git status:", error.message);
  process.exit(1);
}
