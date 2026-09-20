# GitHub Interaction Rules

## CRITICAL RULE FOR AI AGENTS
The AI agent must **NEVER** perform any GitHub or Git operations (e.g., `git commit`, `git push`, creating PRs/Issues) unless the USER **EXPLICITLY** requests it. 

- **No Implicit Commits:** Do not assume that finishing a task means you should commit the code.
- **No Implicit Pushes:** Never push changes to the remote repository.
- **Read-only Git:** You may run read-only git commands like `git status` or `git log` to understand the workspace, but modifying the repository history or syncing with remote is strictly forbidden without explicit permission.
