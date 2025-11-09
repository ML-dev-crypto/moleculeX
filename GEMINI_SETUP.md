# 🤖 Gemini AI Integration Guide

MoleculeX now includes powerful Google Gemini AI features for enhanced analysis quality!

## ✨ What Gemini Adds

### 1. Intelligent Semantic Re-ranking
- **Smart Sorting**: Automatically ranks clinical trials, patents, and literature by relevance
- **Context-Aware**: Understands query intent beyond simple keyword matching
- **Quality Filter**: Prioritizes high-quality, relevant results

### 2. AI-Powered Executive Summaries
- **Natural Language**: Human-readable insights instead of template text
- **Market Intelligence**: Intelligent opportunity and competition analysis
- **Professional Tone**: Compelling summaries suitable for business decisions

### 3. Enhanced Confidence Scoring
- **Quality Assessment**: AI evaluates data comprehensiveness and relevance
- **Blended Scoring**: Combines quantitative metrics with qualitative analysis

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. Edit `.env` and add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 3: Install Dependencies (if needed)

```bash
pip install -U google-genai
```

### Step 4: Restart Backend

```bash
python main.py
```

You should see in backend logs:
```
✅ Semantic search initialized (Gemini-powered)
```

## 🎯 Without Gemini API Key

The app works perfectly fine without Gemini:
- **Basic Mode**: Uses count-based ranking and template summaries
- **No AI Calls**: No external API dependencies
- **Still Functional**: All core features work normally

You'll see:
```
⚠️ GEMINI_API_KEY not found, using basic mode
```

## 📊 Comparison

| Feature | Without Gemini | With Gemini |
|---------|---------------|-------------|
| Result Ranking | Original order | AI-ranked by relevance |
| Executive Summary | Template-based | AI-generated insights |
| Confidence Score | Count-based | AI quality assessment |
| Processing Time | Faster | Slightly slower (+1-2s) |
| Cost | Free | Gemini API usage |

## 💰 Gemini Pricing

- **Free Tier**: 60 requests per minute
- **Sufficient for**: Personal research, demos, testing
- **Production**: Consider rate limits for high-traffic apps

Learn more: [Gemini Pricing](https://ai.google.dev/pricing)

## 🔧 Deployment (Render/Vercel)

### For Render (Backend):

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: `your_api_key`
5. Save and redeploy

### Testing:

Submit a query and check logs for:
```
✅ Generated AI-powered executive summary
✅ Gemini re-ranking applied
```

## 🐛 Troubleshooting

### "Module 'google.generativeai' not found"
```bash
pip install -U google-genai
```

### "API key not found"
- Check `.env` file exists in backend directory
- Verify `GEMINI_API_KEY=...` line (no quotes needed)
- Restart the backend server

### "Gemini re-ranking failed"
- Check your API key is valid
- Verify you have quota remaining
- App will automatically fall back to basic mode

### Logs show "using basic mode"
- `.env` file is missing or incorrect
- API key variable name typo
- Backend not restarted after adding key

## 📖 Example Results

### Before Gemini:
```
Analysis of 'respiratory diseases India' reveals 20 relevant clinical trials, 
with 8 currently active or recruiting. The competitive landscape shows moderate 
competition in India.
```

### After Gemini:
```
Respiratory disease research in India presents a compelling opportunity with 
8 active clinical trials addressing high patient burden diseases including 
COPD and asthma. The moderate competition landscape, combined with 15 recent 
patents in novel delivery mechanisms, suggests significant market potential 
for innovative therapeutic interventions targeting underserved patient populations.
```

## 🎓 Best Practices

1. **Use Gemini for Production**: Significantly better user experience
2. **Monitor API Usage**: Track your Gemini quota
3. **Fallback Ready**: Code gracefully handles API failures
4. **Test Without Key**: Ensure basic mode works before deploying
5. **Secure Keys**: Never commit `.env` to git

## 🚀 Next Steps

With Gemini configured, your analyses will be:
- ✨ More insightful
- 🎯 Better ranked
- 📊 Higher quality
- 💼 More professional

Try running a query and compare the results!

---

**Questions?** Check the main README or open an issue on GitHub.
