# Team VNCS AI Chat

This is a real AI chat web app with an Express backend. The OpenAI API key is server-side only.


## Setup
1. Install Node.js 20+.
2. In this project folder, run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your OpenAI API key to `.env` as `OPENAI_API_KEY=...` (never commit or share this file).
5. Run `npm start` and open http://localhost:3000.

## Deploy
Deploy this Node app to a host that supports server processes (for example Render or Railway). Set the environment variable `OPENAI_API_KEY` in the host's dashboard. Do not upload `.env` or reveal the API key. Follow the host's current deployment instructions. Hosting and API usage may cost money; get a parent/guardian's help and permission before creating accounts or enabling billing.

