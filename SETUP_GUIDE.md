# GitHub Codespaces Setup Guide

## Complete Step-by-Step Instructions for Chromebook Users

### Prerequisites
- GitHub account (free at github.com)
- Chrome browser
- Internet connection

---

## Part 1: Create Your GitHub Repository

### Step 1: Sign into GitHub
1. Go to https://github.com
2. Sign in (or create a free account)

### Step 2: Create New Repository
1. Click the **+** icon in top-right corner
2. Select **New repository**
3. Fill in details:
   - **Repository name:** `golf-swing-analyzer`
   - **Description:** "AI-powered golf swing analysis web app"
   - **Visibility:** Public (or Private if you prefer)
   - **DON'T** check "Initialize with README" (we'll add files)
4. Click **Create repository**

### Step 3: Upload Project Files
You have two options:

#### Option A: Upload via Web Interface (Easiest)
1. Download ALL files from this project to your Chromebook
2. In your new empty repository, click **uploading an existing file**
3. Drag all the project files and folders into the upload area
4. Scroll down and click **Commit changes**

#### Option B: Use GitHub Desktop (If available)
1. Download GitHub Desktop for ChromeOS
2. Clone your repository
3. Copy all project files into the cloned folder
4. Commit and push changes

---

## Part 2: Launch GitHub Codespaces

### Step 1: Open Codespaces
1. In your repository on GitHub, click the green **Code** button
2. Click the **Codespaces** tab
3. Click **Create codespace on main**
4. Wait 2-3 minutes while it sets up (you'll see a loading screen)

### Step 2: Understand the Interface
Once Codespaces loads, you'll see:
- **Left sidebar:** File explorer (your project files)
- **Center:** Code editor (where you'll edit files)
- **Bottom:** Terminal (where you'll run commands)

---

## Part 3: Install Dependencies

### In the Terminal (at the bottom):

```bash
npm install
```

**What this does:** Downloads all required packages (React, Next.js, etc.)

**Wait time:** 1-2 minutes

**You'll see:** Lots of text scrolling. Wait until you see your prompt again (`@username ➜ /workspaces/golf-swing-analyzer`)

---

## Part 4: Run Your App

### Start the development server:

```bash
npm run dev
```

**You should see:**
```
  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000

 ✓ Ready in 2.1s
```

### Step 5: View Your Website

Two ways to open:

**Method 1 (Easiest):**
- Look for a pop-up notification in the bottom-right
- Click **Open in Browser**

**Method 2:**
- Click the **PORTS** tab (next to TERMINAL at bottom)
- Find port **3000**
- Right-click → **Open in Browser**

**You should see:** Your golf swing analyzer website! 🎉

---

## Part 5: Test the Application

1. **Upload a test video** (use drag-and-drop)
   - Accepted formats: MP4, MOV, WebM
   - Size limit: 50MB
   - Duration: 3-60 seconds

2. **Watch the progress indicator**
   - Shows processing steps
   - Takes about 2-3 seconds (mock data)

3. **View results**
   - Score (1-10)
   - Strengths
   - Improvements
   - Key metrics

4. **Try again**
   - Click "Analyze Another Swing"

---

## Part 6: Make Changes to Your Code

### Edit Files:
1. Click any file in the left sidebar to open it
2. Make changes in the editor
3. The website auto-refreshes when you save (Ctrl+S or Cmd+S)

### Example Changes to Try:

**Change the title** (app/page.tsx, line 46):
```typescript
<h1 className="...">
  My Custom Golf Analyzer  {/* Change this */}
</h1>
```

**Change colors** (app/layout.tsx, line 15):
```typescript
<body className="antialiased min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
```

**Add your own tips** (components/UploadZone.tsx, lines 117-121)

---

## Part 7: Add Real AI (Optional)

### Get OpenAI API Key:
1. Go to https://platform.openai.com
2. Sign up (free tier available)
3. Go to API Keys section
4. Create new key
5. Copy the key

### Add to Codespaces:
1. In Codespaces, create file: `.env.local`
2. Add this line:
   ```
   OPENAI_API_KEY=your_key_here
   ```
3. Restart the dev server:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

**Note:** The current version uses mock data. Real AI integration requires additional code (see lib/aiAnalyzer.ts).

---

## Part 8: Save Your Work

### Commit Changes to GitHub:

1. Click the **Source Control** icon in left sidebar (looks like a branch)
2. You'll see changed files listed
3. Type a message describing your changes (e.g., "Added custom title")
4. Click the **✓ Commit** button
5. Click **Sync Changes** to push to GitHub

**Your changes are now saved on GitHub!**

---

## Part 9: Deploy to the Internet (Optional)

### Use Vercel (Free):

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New Project**
4. Select your `golf-swing-analyzer` repository
5. Click **Deploy**
6. Wait 2-3 minutes
7. Get a live URL like: `your-app.vercel.app`

**Your app is now live on the internet!** Share the link with anyone.

---

## Troubleshooting

### "npm install" fails
- Check internet connection
- Try closing and reopening Codespaces
- Run: `rm -rf node_modules package-lock.json && npm install`

### Port 3000 won't open
- Check PORTS tab at bottom
- Make sure port 3000 is listed
- Right-click port → **Port Visibility** → **Public**

### Changes not showing
- Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R)
- Check terminal for error messages (red text)
- Make sure you saved the file (Ctrl+S)

### Codespaces stops working
- You get 60 free hours per month
- Close Codespaces when not using it to save hours
- Click your profile → Settings → Codespaces to check usage

### Video upload fails
- Check file is under 50MB
- Ensure format is MP4, MOV, or WebM
- Try a shorter video (under 30 seconds)

---

## Useful Commands

```bash
# Start development server
npm run dev

# Stop server (in terminal)
Ctrl + C

# Install a new package
npm install package-name

# Check for errors
npm run lint

# Build for production
npm run build

# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

---

## File Structure Reference

```
golf-swing-analyzer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage (main UI)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/               # API endpoints
│       ├── upload/        # File upload handler
│       └── analyze/       # Analysis processor
├── components/            # React components
│   ├── UploadZone.tsx    # Drag-drop upload
│   ├── ProgressIndicator.tsx
│   └── AnalysisResults.tsx
├── lib/                   # Utility libraries
│   ├── videoProcessor.ts
│   ├── poseDetection.ts
│   ├── swingScorer.ts
│   └── aiAnalyzer.ts
├── public/               # Static files
├── package.json          # Dependencies
└── README.md             # This guide
```

---

## Next Steps

### To Build Real Features:

1. **Implement Pose Detection:**
   - Research MediaPipe Pose
   - Add to `lib/poseDetection.ts`

2. **Add Video Processing:**
   - Use FFmpeg or Canvas API
   - Update `lib/videoProcessor.ts`

3. **Integrate Real AI:**
   - Add OpenAI API calls
   - Update `lib/aiAnalyzer.ts`

4. **Add Cloud Storage:**
   - Set up AWS S3 or similar
   - Store videos temporarily

5. **Improve UI:**
   - Add animations
   - Show frame snapshots
   - Add comparison features

---

## Resources

- **Next.js Tutorial:** https://nextjs.org/learn
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **MediaPipe:** https://google.github.io/mediapipe
- **OpenAI API:** https://platform.openai.com/docs

---

## Getting Help

- **Check terminal for errors** (red text)
- **Search error messages** on Google/Stack Overflow
- **GitHub Issues:** Ask questions in your repo's Issues tab
- **Next.js Discord:** https://nextjs.org/discord

---

## Tips for Chromebook Users

✅ **DO:**
- Commit changes frequently (don't lose work)
- Close Codespaces when done (save free hours)
- Use keyboard shortcuts (Ctrl+S to save, Ctrl+P to find files)
- Keep browser tab open while server is running

❌ **DON'T:**
- Leave Codespaces running overnight
- Delete files without Git backup
- Share your .env.local file (contains secrets)

---

**You're all set! Happy coding! 🏌️‍♂️⛳**
