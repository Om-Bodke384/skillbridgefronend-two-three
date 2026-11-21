# SkillBridge — Frontend

React web app for **SkillBridge**, a developer community platform where students and mentors learn, collaborate, and grow together.

**Live app:** https://skillbridgefronend-two-three.vercel.app
**Backend repo:** [skillbridge-backend-two](https://github.com/Om-Bodke384/skillbridge-backend-two)

## Features

- **Sign in / Sign up** — email and password, plus **Continue with Google**
- **Dashboard** — your communities, events, and announcements at a glance
- **Communities & real-time chat** — join communities and message live
- **Townhalls, Events & Hackathons** — browse and register
- **Learning** — courses and learning resources
- **Peer Review & Peer Mentorship** — give and get feedback, find mentors
- **Live streaming** — host and watch live sessions (Agora)
- **SkillBot** — built-in AI assistant
- **Profile and Admin pages** — account settings and platform management
- Lazy-loaded routes, role-based route guards, toast notifications

## Tech Stack

React 18 (Create React App), Redux Toolkit, React Router, Axios, Socket.IO client, Agora RTC SDK, `@react-oauth/google`, React Hook Form, React Hot Toast, React Icons, date-fns.

## Project Structure

```
src/
  App.js, index.js     # app shell, routes, providers
  components/          # auth, community, layout, ui
  pages/               # dashboard, landing, auth, community, chat, events,
                       # hackathon, learning, live, peer-review,
                       # peer-mentorship, townhall, announcements, admin
  services/            # API client (Axios) and socket setup
  store/               # Redux store and slices
```

## Getting Started

```bash
git clone https://github.com/Om-Bodke384/skillbridgefronend-two-three.git
cd skillbridgefronend-two-three
npm install
cp .env.example .env     # then fill in the values
npm start                # runs on http://localhost:3000
```

Build for production: `npm run build`

## Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | backend base URL ending in `/api` |
| `REACT_APP_SOCKET_URL` | backend base URL (no `/api`) |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Web client ID (same as backend `GOOGLE_CLIENT_ID`) |

Create React App reads variables at build time, so redeploy after changing them. If `REACT_APP_GOOGLE_CLIENT_ID` is missing, the Google button is hidden and email login still works.

## Google Sign-In Setup

In Google Cloud Console, create an OAuth **Web application** client and add your site as an **Authorized JavaScript origin** (for example `http://localhost:3000` and your Vercel domain). No redirect URI is needed.

## Deployment

Deployed on **Vercel**. Set the three variables above in Vercel project settings and redeploy.

## Authors

Built by the SkillBridge team — Om Bodke, Shravani, and Nikita.
