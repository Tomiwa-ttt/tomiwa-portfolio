# Tomiwa Ajibola portfolio (Netlify + Gemini live chat)

## Files
- index.html, favicon.svg, og.jpg: the site
- netlify/functions/ask.mjs: live AI answers for "Ask my portfolio" using Google Gemini
- netlify.toml: tells Netlify where the site and function are

## Turn on live chat
1. Upload this whole folder (keep the netlify folder) to the GitHub repo Tomiwa-ttt/tomiwa-portfolio.
2. Netlify > Add new site > Import an existing project > GitHub > tomiwa-portfolio > Deploy.
3. Get a Gemini key at https://aistudio.google.com/apikey
4. Netlify > Site configuration > Environment variables > add GEMINI_API_KEY = your key. Redeploy.
5. The chat badge on the site changes from "Quick answers" to "Live AI answers".

If the key is missing or fails, the chat answers from the built-in FAQ instead.
