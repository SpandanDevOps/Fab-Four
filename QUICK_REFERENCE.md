# JAAGRUK - QUICK REFERENCE GUIDE ⚡

## 🎯 ONE-MINUTE SETUP

### Windows Users
```powershell
# Double-click setup.bat in the JYV folder
# OR manually:
cd frontend
npm install
# Edit .env with your Gemini API key
npm run dev
```

### Mac/Linux Users
```bash
cd JYV
bash setup.sh
cd frontend
npm run dev
```

---

## 📝 configuration Checklist

### Before Running
- [ ] Node.js 18+ installed? (Check: `node -v`)
- [ ] npm installed? (Check: `npm -v`)
- [ ] In JYV root directory? (Check: `frontend/package.json` exists)
- [ ] Gemini API key obtained? (Get from: https://ai.google.dev/)

### Environment Setup
- [ ] `frontend/.env` created from `.env.example`?
- [ ] `VITE_GEMINI_API_KEY` added to `frontend/.env`?
- [ ] `VITE_API_URL=http://localhost:4000/api` in `frontend/.env`?

### Dependencies
- [ ] Frontend: `npm install` completed?
- [ ] Backend (optional): `npm install` completed?

---

## 🚀 START HERE

### Step 1: Open Terminal/Command Prompt
```
Windows: Open PowerShell or Command Prompt
Mac/Linux: Open Terminal
```

### Step 2: Navigate to Frontend
```bash
cd JYV
cd frontend
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: It Opens Automatically! 🎉
```
Browser → http://localhost:3000
```

---

## 🧪 TEST FLOW (2 Minutes)

1. **Home Screen** → Click "Report an Issue"
2. **Identity** → Select "Named" or "Anonymous"
3. **Chat** → Type: "There's a pothole near the park"
4. **Location** → Click "Confirm Location"
5. **Evidence** → Click "Skip for now" (optional)
6. **Analysis** → Review AI classification
7. **Review** → Check all details
8. **Submit** → Click "Submit to JAAGRUK"
9. **Confirmation** → Get blockchain confirmation! ✅

**Time**: ~2 minutes for full flow
**Result**: Immutable blockchain record created

---

## 📍 KEY PORTS

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend (optional) | 4000 | http://localhost:4000 |
| API | 4000/api | http://localhost:4000/api |

---

## 🎨 INTERFACE FEATURES

### Home Screen
- **Report an Issue** → Main reporting flow
- **Emergency SOS** → Direct police dispatch
- Stats: Reports submitted & Resolved

### Reporting Flow
1. **Identity**: Named (with ID) or Anonymous (100% private)
2. **Chat**: Natural language description
3. **AI Analysis**: Auto-categorization (Crime, Infrastructure, etc.)
4. **Location**: Pick incident area on map
5. **Evidence**: Add photos/videos
6. **Review**: Final check
7. **Blockchain**: Immutable recording
8. **Confirmation**: Reference ID + Timeline

### Dark Mode
- Toggle via Sun/Moon icon in header
- Auto-detected from system preference
- Persists in session

---

## ⚙️ COMMON COMMANDS

### Frontend Development
```bash
npm run dev              # Run dev server (auto-reload)
npm run build            # Production build
npm run preview          # Preview production locally
npm run lint             # Check TypeScript errors
```

### Backend (if running)
```bash
npm run dev              # Development
npm run build            # TypeScript build
npm start                # Production
```

### Port Management
```bash
# If port 3000 is in use:
npm run dev -- --port 3001

# Kill process on port 3000:
Windows: netstat -ano | findstr :3000
Mac/Linux: lsof -i :3000
```

---

## 🛠️ TROUBLESHOOTING QUICK FIXES

### "Cannot connect to server"
```
✅ Make sure backend is running:
  cd backend
  npm run dev

✅ Verify VITE_API_URL in frontend/.env
✅ Check backend is on http://localhost:4000
```

### "Gemini API not working"
```
✅ Get new key: https://ai.google.dev/
✅ Add to frontend/.env: VITE_GEMINI_API_KEY=your_key
✅ Restart dev server after editing .env
```

### "Styling looks broken"
```
✅ Clear browser cache: Ctrl+Shift+Delete
✅ Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
✅ Rebuild: npm run build
```

### "npm install fails"
```
✅ Clear cache: npm cache clean --force
✅ Delete node_modules: rm -rf node_modules
✅ Reinstall: npm install
```

### "Port already in use"
```
npm run dev -- --port 3001
# Then open: http://localhost:3001
```

---

## 📊 AI CLASSIFICATION

Gemini AI automatically classifies reports:

| Input | Category | Urgency | Action |
|-------|----------|---------|--------|
| "Pothole..." | Infrastructure | Medium | Municipal Corp |
| "Assault..." | Crime/Safety | Critical | Police Station |
| "Fire..." | Emergency | Critical | Fire Dept |
| "Garbage..." | Environmental | Medium | Civic Dept |
| "Bribery..." | Corruption | High | Anti-Corruption |

---

## 🔐 SECURITY FEATURES

✅ **Blockchain** — Reports cannot be deleted or altered
✅ **Encryption** — Data encrypted in transit
✅ **Privacy** — Anonymous mode = zero identity leak
✅ **Immutable** — Permanent record on blockchain
✅ **Verifiable** — Citizen can verify anytime

---

## 📱 RESPONSIVE DESIGN

✅ Mobile (320px - 480px)
✅ Tablet (480px - 768px)
✅ Desktop (768px+)
✅ Dark mode
✅ Offline ready (local caching)

---

## 🌐 DEPLOYMENT

### Quick Deploy to Vercel
```bash
npm i -g vercel
cd frontend
vercel deploy
```

### Docker Setup
```bash
cd frontend
docker build -t jaagruk-frontend .
docker run -p 3000:3000 jaagruk-frontend
```

---

## 📚 DOCUMENTATION MAP

| File | Purpose |
|------|---------|
| `README.md` | Main project overview & setup |
| `FRONTEND_SETUP.md` | Detailed frontend guide |
| `setup.sh` / `setup.bat` | Auto setup script |
| `.env.example` | Environment template |
| `src/App.tsx` | All UI screens |
| `src/services/apiService.ts` | API calls |
| `src/services/geminiService.ts` | AI classification |

---

## 🎓 LEARNING PATH

1. ✅ **Run the app** → `npm run dev`
2. ✅ **Try the flow** → Submit a test report
3. ✅ **Check console** → See API calls & AI response
4. ✅ **Read code** → Check `App.tsx` for screen flow
5. ✅ **Modify** → Change colors in `tailwind.config.ts`

---

## 💡 PRO TIPS

### Development
- 🔥 **HMR Enabled** — Changes auto-reload (no page refresh!)
- 🐛 **Console Logs** → Check Browser DevTools (F12)
- 📱 **Mobile Preview** → Resize to mobile in DevTools
- 🌙 **Dark Mode** → Toggle to test both themes

### Testing
- 🧪 Test all three screens: Home, Chat, Emergency
- 📸 Try with/without evidence
- 😎 Test dark/light mode switching
- 🎯 Verify blockchain confirmation shows up

### Debugging
- Check `.env` file is correct
- Check browser console for errors (F12)
- Check backend logs if errors occur
- Try hard refresh (Ctrl+F5) if styling issues

---

## 🆘 QUICK HELP

**Need help?**
1. Check `README.md` → Troubleshooting section
2. Check `FRONTEND_SETUP.md` → FAQs
3. See console errors (Press F12 in browser)
4. Verify `.env` configuration

**API not working?**
```bash
# Test backend:
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

**Want to reset?**
```bash
# Start fresh:
rm -rf frontend/node_modules
npm install
npm run dev
```

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Goal |
|--------|--------|------|
| Page Load | <1.5s | ✅ Optimized |
| AI Response | <3s | ✅ Fast |
| Blockchain | <5s | ✅ Normal |
| Bundle Size | <250KB | ✅ Small |

---

## 🏁 SUCCESS CHECKLIST

- [ ] Frontend running on port 3000
- [ ] Can see JAAGRUK home screen
- [ ] Can click "Report an Issue"
- [ ] Can type in chat
- [ ] Can select location
- [ ] Can submit report
- [ ] Can see blockchain confirmation
- [ ] Reference ID displays
- [ ] Dark mode works
- [ ] All screens load without errors

When all ✅ → Platform is ready! 🎉

---

## 🎯 NEXT STEPS

### For Testing
```
npm run dev → Report something → Get confirmation
```

### For Development
```
• Edit frontend/src/App.tsx → Add new screens
• Edit frontend/src/services/geminiService.ts → Change AI logic
• Edit frontend/tailwind.config.ts → Change colors
```

### For Deployment
```
npm run build → dist/ folder ready to deploy
```

---

## 📞 SUPPORT LINKS

- **Main Site**: https://jaagruk.in (coming soon)
- **GitHub**: [Project repository]
- **Email**: support@jaagruk.in
- **Gemini API**: https://ai.google.dev/
- **Node.js**: https://nodejs.org/

---

## 🎉 YOU'RE READY!

```
1. Just run: npm run dev
2. Browser opens automatically
3. Report something
4. Get blockchain confirmation
5. Mission accomplished! ✅
```

**That's it!** JAAGRUK will be running locally on your machine.

---

**Built with ❤️ for India**  
*JAAGRUK - Your Voice*  
*Making democracy work for everyone*

---

**Last Updated**: February 2026  
**Status**: Production Ready  
**Version**: 1.0.0
