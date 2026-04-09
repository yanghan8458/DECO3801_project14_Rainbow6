#  Frontend Integration Guide 

Our backend now works like a real server. You just need to send a URL to it, and it will give you back all the formatted scores and UI cards.

---

## 🛠 Part 1: Setting up your local environment

Since the backend runs on your computer locally during development, you need to set up the environment first.

### Step 1: Install Node.js (If you haven't already)
Our backend needs Node.js to run.
1. Go to the official website: https://nodejs.org/
2. Download and install the **LTS (Long Term Support)** version.
3. Keep clicking "Next" until it finishes.

### Step 2: Download the backend code
Make sure you have pulled the latest code from our group's GitHub repository.

### Step 3: Install backend dependencies
1. Open your code editor (like VS Code).
2. Open a terminal and make sure you are inside the backend folder (where `server.js` is).
3. Type this command and hit Enter:
   ```bash
   npm install
   ```
   *(This will download all the necessary tools like Express and Puppeteer. It might take a minute or two.)*

### Step 4: Start the server!
1. In the same terminal, type:
   ```bash
   node server.js
   ```
2. If you see this message: `server is up and running on http://localhost:3000`, **CONGRATULATIONS!** 🎉 The backend is now alive. 
3. **Important:** Do NOT close this terminal while you are testing the frontend. Let it run in the background.

---

## 💻 Part 2: How to call the API in Frontend

Now that the backend is running at `http://localhost:3000`, you can talk to it using JavaScript in your frontend code.

### The API Details
- **URL Endpoint:** `http://localhost:3000/api/analyze`
- **Method:** `POST`
- **What you send:** `{ "url": "https://the-website-user-typed.com" }`

---

## 📦 Part 3: What the Data Looks Like

When the fetch is successful, the `data` variable will give you a beautiful, frontend-friendly JSON. 

```json
{
  "url": "[https://www.uq.edu.au](https://www.uq.edu.au)",
  "overallScore": 65,
  "overallStatus": "warning",
  "details": [
    {
      "category": "language",
      "score": 60,
      "status": "warning",
      "insights": [
        {
          "section": "language",
          "metric": "sentenceAverageLength",
          "value": 24.6,
          "problem": "Sentences are too long",
          "suggestion": "Use shorter sentences or bullet points",
          "mapping": {
            "wcag": "3.1.5 Reading Level",
            "iso": "Efficiency"
          }
        }
      ]
    },
    {
      "category": "visual",
      "score": 85,
      "status": "good",
      "insights": [] 
    }
  ]
}
```
