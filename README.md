# AI Golf Swing Analyzer

A web application that analyzes golf swing videos using AI pose detection and provides personalized coaching feedback.

## 🚀 Quick Start with GitHub Codespaces

### Step 1: Create a New Repository
1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Name it: `golf-swing-analyzer`
4. Make it **Public** or **Private**
5. Click **Create repository**

### Step 2: Upload This Code
1. Download all the files from this project
2. In your new repository, click **Add file** → **Upload files**
3. Drag and drop all the project files
4. Click **Commit changes**

### Step 3: Launch Codespaces
1. In your repository, click the green **Code** button
2. Click **Codespaces** tab
3. Click **Create codespace on main**
4. Wait 2-3 minutes for setup

### Step 4: Install Dependencies
Once Codespaces opens, in the terminal at the bottom:
```bash
npm install
```

### Step 5: Run the Development Server
```bash
npm run dev
```

### Step 6: View Your App
- Click the pop-up notification that says "Open in Browser"
- Or click **PORTS** tab → right-click port 3000 → **Open in Browser**

You should see your golf swing analyzer running! 🎉

## 📁 Project Structure

```
golf-swing-analyzer/
├── app/
│   ├── page.tsx              # Homepage with upload
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── upload/route.ts   # Upload endpoint
│       └── analyze/route.ts  # Analysis endpoint
├── components/
│   ├── UploadZone.tsx        # Drag-and-drop upload
│   ├── AnalysisResults.tsx   # Results display
│   └── ProgressIndicator.tsx # Loading state
├── lib/
│   ├── videoProcessor.ts     # Frame extraction
│   ├── poseDetection.ts      # MediaPipe integration
│   ├── swingScorer.ts        # Scoring algorithm
│   └── aiAnalyzer.ts         # LLM feedback
├── public/
│   └── sample-swing.mp4      # Test video
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎯 Current Features (Phase 1 MVP)

- ✅ Video upload interface (drag & drop)
- ✅ Client-side video validation
- ✅ Progress indicator
- ✅ Mock analysis results (ready for AI integration)
- ✅ Responsive design
- ✅ Dark mode support

## 🔜 Next Steps to Complete

1. **Add OpenAI API Key**
   - Get key from [platform.openai.com](https://platform.openai.com)
   - Create `.env.local` file:
     ```
     OPENAI_API_KEY=your_key_here
     ```

2. **Integrate MediaPipe** (see `lib/poseDetection.ts`)
3. **Deploy to Vercel** (one-click from Codespaces)

## 🛠 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check code quality
```

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **AI:** OpenAI GPT-4 (for feedback)
- **Pose Detection:** MediaPipe (planned)

## 💡 Tips for Chromebook Users

- Codespaces gives you 60 free hours per month
- Save your work by committing to GitHub regularly
- Close Codespaces when not using to save hours
- Can access from any device with a browser

## 🐛 Troubleshooting

**Port not opening?**
- Check PORTS tab in terminal
- Make sure port 3000 is public (right-click → Port Visibility → Public)

**Module not found?**
- Run `npm install` again
- Restart Codespaces

**Changes not showing?**
- Hard refresh browser (Ctrl+Shift+R)
- Check terminal for errors

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose)
- [OpenAI API](https://platform.openai.com/docs)

## 📝 License

MIT - Feel free to use for your own projects!
