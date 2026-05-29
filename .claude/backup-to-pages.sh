#!/bin/bash
# Backup report.html to personal GitHub Pages before git pull/merge/rebase
# This script is triggered by Claude Code PreToolUse hook on Bash commands

REPORT="/Users/addietang/Documents/cvm/openclaw-enterprise/docs/design-audit/component-index/report.html"
REPO_URL="https://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@github.com/addietang-tencent/addietang-tencent.github.io.git"
TMP_DIR="/tmp/pages-backup-$$"

# Only proceed if report.html exists
if [ ! -f "$REPORT" ]; then
  exit 0
fi

# Clone, copy, commit, push
git clone --depth 1 "$REPO_URL" "$TMP_DIR" 2>/dev/null || exit 0
cp "$REPORT" "$TMP_DIR/index.html"
cd "$TMP_DIR"

# Only push if there are actual changes
if git diff --quiet index.html 2>/dev/null; then
  rm -rf "$TMP_DIR"
  exit 0
fi

git add index.html
git commit -m "Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
git push 2>/dev/null
rm -rf "$TMP_DIR"
