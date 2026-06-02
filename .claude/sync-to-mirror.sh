#!/bin/bash
# Sync all origin branches + tags to personal mirror repo.
# Triggered after `git push` to keep addietang-tencent/openclaw-enterprise-mirror up to date.

set -e

REPO_DIR="/Users/addietang/Documents/cvm/openclaw-enterprise"
MIRROR_REMOTE="mirror"
LOCK_FILE="/tmp/sync-to-mirror.lock"
LOG_FILE="/tmp/sync-to-mirror.log"

# Avoid concurrent runs
if [ -f "$LOCK_FILE" ]; then
  if [ $(($(date +%s) - $(stat -f %m "$LOCK_FILE" 2>/dev/null || echo 0))) -gt 300 ]; then
    rm -f "$LOCK_FILE"
  else
    exit 0
  fi
fi
touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$REPO_DIR" || exit 0

if ! git remote get-url "$MIRROR_REMOTE" >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] mirror remote not configured, skip" >> "$LOG_FILE"
  exit 0
fi

{
  echo ""
  echo "=== [$(date '+%Y-%m-%d %H:%M:%S')] sync-to-mirror start ==="

  git fetch origin --prune --tags 2>&1 | tail -5

  REFSPECS=$(git for-each-ref --format='+%(refname):refs/heads/%(refname:lstrip=3)' refs/remotes/origin/ | grep -v 'origin/HEAD$')
  SUCCESS=0
  FAIL=0
  while IFS= read -r refspec; do
    if [ -z "$refspec" ]; then continue; fi
    if git push "$MIRROR_REMOTE" "$refspec" 2>&1 | grep -qE "error|fatal|rejected"; then
      FAIL=$((FAIL+1))
    else
      SUCCESS=$((SUCCESS+1))
    fi
  done <<< "$REFSPECS"

  TAG_RESULT=$(git push "$MIRROR_REMOTE" --tags 2>&1 | tail -3)

  echo "branches: $SUCCESS ok / $FAIL failed"
  echo "tags: $TAG_RESULT"
  echo "=== sync-to-mirror done ==="
} >> "$LOG_FILE" 2>&1
