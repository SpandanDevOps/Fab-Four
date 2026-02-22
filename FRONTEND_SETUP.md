# JAAGRUK - YOUR VOICE | Frontend Setup Guide

## Overview

JAAGRUK is a secure, AI-powered civic reporting platform for India. This frontend is built with React, TypeScript, Tailwind CSS, and integrates with Google Gemini AI for incident classification.

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   ├── services/
│   │   ├── apiService.ts       # Backend API communication
│   │   └── geminiService.ts    # Google Gemini AI integration
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Environment variables template
├── vite.config.ts              # Vite build configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Prerequisites

- **Node.js**: v16 or higher (v18+ recommended)
- **npm**: v8 or higher
- **Backend**: JAAGRUK backend running on `http://localhost:4000` (optional for demo)
- **Google Gemini API Key**: For AI-powered incident classification

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```dotenv
# Backend API URL
VITE_API_URL=http://localhost:4000/api

# Google Gemini API Key (get from https://ai.google.dev/)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**To get a Gemini API Key:**
1. Visit: https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key in Google Cloud Console
4. Copy and paste it into `.env`

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

**Features enabled in dev mode:**
- Hot Module Reloading (HMR)
- Development error logging
- API proxy to backend

### 4. Build for Production

```bash
npm run build
```

Output files will be in `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Platform Features

### 🏠 Home Screen
- Report an issue
- Emergency SOS button
- Platform statistics

### 🆔 Identity Selection
- **Named Reporting**: Identity visible to authorities (faster processing)
- **Anonymous Reporting**: Complete privacy with safeguards

### 💬 Chat Flow
- Conversational incident description
- Natural language input
- Voice input option (UI ready)

### 📍 Location Picker
- Interactive map to select incident location
- Automatic nearest police station detection
- Address auto-completion

### 📸 Evidence Upload
- Photo/video capture from camera
- Gallery upload
- Multiple evidence slots
- Encrypted transmission to authorities

### 🧠 AI Analysis
- Google Gemini AI classification
- Incident categorization:
  - Crime / Safety
  - Infrastructure Issues
  - Traffic Violations
  - Environmental Problems
  - Public Health Issues
  - Corruption
  - Emergency Situations
- Urgency level detection (Critical, High, Medium, Low)
- Automatic authority routing

### ✅ Review & Submission
- Full report review before submission
- Blockchain recording guarantee
- Immutable record confirmation

### 🔐 Confirmation Screen
- Blockchain verification
- Reference ID with copy functionality
- Status timeline
- Verification of blockchain integrity

### 🚨 Emergency SOS
- Immediate dispatch to nearest police station
- Direct call to Police (100)
- Get directions to station
- Coordinate live tracking

## API Endpoints

The frontend communicates with the backend at the configured `VITE_API_URL`:

### Reports
- `POST /reports` - Submit a new report
- `GET /reports` - Fetch reports (with filters)
- `GET /reports/:id` - Get specific report
- `GET /reports/:id/verify` - Verify blockchain integrity
- `PATCH /reports/:id/status` - Update report status (admin)

### Blockchain
- `GET /reports/blockchain/health` - Check blockchain integrity

### Health
- `GET /health` - Backend health check

## Dark Mode

The platform includes dark mode support:
- Toggle in header
- Preference persists in session
- Automatic based on system preference (can be added)

## Styling & Customization

### Tailwind CSS
Main colors are defined in `tailwind.config.ts`:
- **Primary**: `#2BBDEE` (Blue)
- **Background Light**: `#ffffff` (White)
- **Background Dark**: `#0f172a` (Dark Slate)

### Responsive Design
- Mobile-first approach
- Max-width: 480px (mobile viewport)
- Optimized for phones and tablets

## Performance Optimizations

- Code splitting with React.lazy (if needed)
- Image optimization with placeholders
- Efficient re-rendering with React hooks
- Tailwind CSS purging for production

## Troubleshooting

### Build Errors

**Issue**: TypeScript errors
```bash
npm run lint  # Check for type errors
```

**Issue**: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend Connection Issues

**Issue**: "Cannot connect to JAAGRUK server"
- Ensure backend is running on `http://localhost:4000`
- Check `VITE_API_URL` in `.env`
- Verify CORS configuration on backend

### Gemini API Issues

**Issue**: "No API key configured. Using fallback classification."
- Get API key from https://ai.google.dev/
- Add to `.env` as `VITE_GEMINI_API_KEY`
- Restart dev server after `.env` changes

### Styling Issues

**Issue**: Colors not rendering correctly
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild Tailwind CSS: `npm run build`
- Check if dark mode is enabled

## Deployment

### To Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Environment variables will be configured in Vercel dashboard.

### To Any Static Host
```bash
npm run build
# Upload `dist/` folder to your hosting
```

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=0 /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:
```bash
docker build -t jaagruk-frontend .
docker run -p 3000:3000 -e VITE_API_URL=http://backend:4000/api jaagruk-frontend
```

## Development Workflow

### Type Checking
```bash
npm run lint
```

### Code Formatting (if prettier installed)
```bash
npm run format  # (if configured)
```

### Running Tests (if Jest configured)
```bash
npm test  # (if configured)
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest 2 versions

## Security Considerations

1. **API Key Protection**: Never commit `.env` to git
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure backend CORS properly
4. **Data Encryption**: All reports encrypted before transmission
5. **CSP Headers**: Configure Content Security Policy

## Performance Targets

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

## Support & Contact

For issues or questions:
- GitHub Issues: [project-repo]
- Email: support@jaagruk.in
- WhatsApp: [contact]

## License

MIT License - See LICENSE file for details

---

**Last Updated**: February 2026
**Framework**: React 19 + TypeScript 5.8 + Tailwind CSS 4.1 + Vite 6.2
