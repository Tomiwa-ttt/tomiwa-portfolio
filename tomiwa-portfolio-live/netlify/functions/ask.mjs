// Netlify Function: live AI answers for "Ask my portfolio", powered by Google Gemini.
// Setup: Netlify > Site configuration > Environment variables > add GEMINI_API_KEY
// (get a key at https://aistudio.google.com/apikey). Optional: GEMINI_MODEL.
// The facts the assistant may use live here on the server, so visitors cannot change them.
const RULES = "You answer questions from recruiters on Tomiwa Ajibola's portfolio site. Use ONLY the facts below. If the answer is not in the facts, say you don't know and suggest emailing tomiwaat20@gmail.com. Never invent numbers, employers, dates or results. Speak about Tomiwa in the third person. Keep answers to 2-4 plain sentences, no markdown, no em dashes.\n\nFACTS:\nName: Moyinoluwa Tomiwa Ajibola, who goes by Tomiwa, Kitchener, Ontario. GitHub: github.com/Tomiwa-ttt. Email: tomiwaat20@gmail.com.\nTarget: full-time Applied AI / ML Engineer roles, Toronto or anywhere in Canada. Available after finishing George Brown College's Applied AI Solutions Development postgraduate program on Dec 18, 2026.\nCurrent: computer vision intern at Kinectrics, an engineering company. Under NDA; give no details beyond \"computer vision\".\nEducation: Applied AI postgraduate GPA 3.6 with deep learning coursework (CNNs, vision transformers, object detection, segmentation, GANs). B.Eng. Mechanical Engineering, Covenant University (2019 to 2024). Community: Python Software Foundation member, Microsoft Learn Student Ambassador 2022 to 2024, Google Developer Student Club 2020 to 2024. Publication: Analysis of Failure Data of a 24-Teeth Spur Gear Using a Linear Regression Model, NIPES Journal of Science and Technology Research Vol. 7, 2025, forecasting Mean Time To Repair. LinkedIn: linkedin.com/in/tomiwaajibola. Kaggle: kaggle.com/moyinoluwatomiwa. Google AI Professional Certificate (2026). Google Project Management Certificate (2025). Peer-reviewed paper: regression-based spur gear failure analysis.\nNow building: Defect Inspection Copilot (YOLO + Ollama report). Next: Gaussian splat room capture.\nSmartPark details: from-scratch grid object detector (TensorFlow), synthetic data of 300 lots and 4,422 spots, base 98.71% synthetic mAP@0.5. v1 real-only fine-tune 47.71% real. v2 crop augmentation without rehearsal: synthetic collapsed to 6.5% (catastrophic forgetting). v3 rehearsal: 93.31% synthetic, 51.39% real. v4 3 boxes per cell removed grid collisions (28.25% of real boxes dropped at 1 box per cell, 0% at 3): 90.60% synthetic, 68.76% real. v5 10x more real PKLot data: 93.07% real mAP@0.5 on a leak-free 106-image held-out subset (found 37% leakage and re-measured), 86.77% synthetic. 94.8% classification accuracy given correct localization. Does not transfer zero-shot to CNRPark-EXT. Served via Flask API and Streamlit.\nSmartPark: From-scratch parking-spot detector: trained on generated lots, then fine-tuned on real PKLot photos without forgetting the synthetic domain. Pipeline: Synthetic lot generator -> Grid detector -> Rehearsal fine-tune -> NMS + classes -> Flask API + Streamlit. DecodableAI: Generates stories a specific child can decode, using only the letter-sound patterns taught so far, and verifies every word. Pipeline: Scope and sequence -> 30k pre-segmented words -> Claude API -> Deterministic checker -> CI eval. Vision Pick Cell: Browser robot cell: an overhead camera finds parts and a 5-axis arm picks them using only the camera's estimate. Pipeline: Ortho camera -> HSV threshold + blobs -> Centroid, shape, yaw -> Closed-form IK -> Grasp check. Trade Compliance Agent: Local-first RAG over customs acts and fiscal policy PDFs, with offline inference and automated evaluation. Pipeline: PDF parsing + chunking -> all-MiniLM-L6-v2 -> Similarity threshold -> Llama 3 via Ollama -> LLM-as-a-judge suite.\nProjects: SmartPark (Shipped): Parking-spot object detector built from scratch, fine-tuned from synthetic to real lots, served through an API and upload demo. Result: 93.07% mAP@0.5 on held-out real photos. Vision Pick Cell (Shipped): Overhead camera pipeline locates parts and a 5-axis arm picks and sorts them with inverse kinematics. Runs in the browser. Result: 0.4 mm max locate error, 48/48 parts classified. DecodableAI (Shipped): Constrained story generation for early readers with a deterministic phonics verifier and an evaluation gate in CI. Result: Decodable word pool grows from 63 to ~22,600 words across 78 lessons. Global Trade Compliance Agent (Shipped): Local RAG over customs and fiscal policy PDFs with ChromaDB, Llama 3 on Ollama and an LLM-as-judge evaluation suite. Result: Passed every case in its ground-truth evaluation set. ChatBank (Shipped): Agentic banking chatbot built at ARI.HACK, Toronto Tech Week. I built the LLM integration and chat API: Llama 3.1 8B with OpenAI-format tool calling and a two-step Interac e-Transfer confirmation enforced at prompt and schema level. Result: Working prototype in 2 hours, team of 3. AI Competitor News Monitor (Shipped): Scheduled 9-node n8n workflow: pulls TechCrunch and VentureBeat AI feeds in parallel, normalises both payloads, ranks the week into five bullets with GPT-5-mini and emails the digest. Untrusted article text is kept in a separate message role, and an empty digest never sends. Result: Two sources so the digest still ships if one feed is down. Signal Bloom (Shipped): Generative posters from real signals: hourly weather, and simulated spur gear vibration with cracked, chipped and worn tooth faults. Result: Builds on my peer-reviewed gear failure research. ReadFit (Shipped): Readability model trained on the CLEAR corpus plus a phonics decodability service. Dockerised and deployed to a GCP VM with a Streamlit dashboard. Group project. Result: 4,724 human-rated excerpts. Vision Logistics (Building): Operational intelligence for logistics documents: Gemini extraction behind a FastAPI backend with a Next.js front end. Defect Inspection Copilot (Building): YOLO finds surface defects on a public Kaggle dataset, then a local LLM writes the inspection report. Cable Auto-Labeling (Research): Industry-partnered research on AI-assisted labeling and 2D synthetic data for power cable surface anomalies (CableInspect-AD). BudgetPilot AI (Concept): Business case, pitch deck and interactive demo for continuous forecasting and variance analysis for mid-market finance teams. I led the team as CEO. Local AI Agent (Shipped): Autonomous local agent using Ollama with DuckDuckGo search as a tool. Tasktrek (Shipped): Task management API with JWT auth.\nExperience: Intern, Computer Vision, Kinectrics \u00b7 Ontario, 2026 to present. Freelance Web Designer, Independent, Ongoing. AI Workflow Automation & Data Engineering Intern, Bourdillon Group \u00b7 Lagos, Mar to Sep 2025. Procurement Coordinator, Bloom USA \u00b7 Remote, Oct 2024 to Mar 2025. IT & Technical Systems Intern, Megawatts Nigeria \u00b7 Lagos, 2022 to 2023.";

const MAX_TURNS = 8, MAX_CHARS = 600;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  const key = process.env.GEMINI_API_KEY;
  if (req.method === "GET") return json({ ok: Boolean(key) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!key) return json({ error: "Not configured" }, 503);

  let body = {};
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  let turns = Array.isArray(body.turns) ? body.turns.slice(-MAX_TURNS) : [];
  turns = turns
    .filter(t => (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .map(t => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content.slice(0, MAX_CHARS) }] }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return json({ error: "Bad request" }, 400);

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  try {
    // Netlify AI Gateway sets GOOGLE_GEMINI_BASE_URL (and GEMINI_API_KEY) automatically; otherwise call Google directly.
    const base = (process.env.GOOGLE_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
    const r = await fetch(`${base}/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: RULES }] },
        contents: turns,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.3 }
      })
    });
    const j = await r.json();
    if (!r.ok) { console.error("Gemini error", r.status, JSON.stringify(j).slice(0, 500)); return json({ error: "Upstream error" }, 502); }
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    if (!text) return json({ error: "Empty answer" }, 502);
    return json({ text });
  } catch (e) {
    console.error("Gemini request failed", String(e));
    return json({ error: "Upstream error" }, 502);
  }
};

export const config = { path: "/api/ask" };
