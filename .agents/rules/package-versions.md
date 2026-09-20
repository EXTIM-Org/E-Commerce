# Package Versioning Rules

## CRITICAL RULE FOR AI AGENTS
When installing any new npm packages, libraries, or dependencies, the AI agent MUST **always use the latest stable version**. 

- **Avoid outdated versions:** Do not use older versions of packages just because they are in your training data. Check for the latest stable tags.
- **Avoid beta/rc:** Do not use `beta`, `alpha`, or `rc` (release candidate) versions unless explicitly asked. Stick to stable releases to ensure long-term maintainability without forcing the user to refactor soon.
