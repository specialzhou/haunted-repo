# Tech
- Static site, TypeScript, no backend. Deploy to GitHub Pages or Vercel; the URL must stay live until 2027-01-29.
- No paid API keys in code. Default mode uses a bundled snapshot; live mode uses the public GitHub API only.
- Use only public issue fields: number, title, labels, created_at, html_url. Never store bodies, comments, usernames or avatars.
- The issue-to-monster mapping is a pure function and is covered by property-based tests.
