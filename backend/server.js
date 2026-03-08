'use strict';

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI   = require('openai');
const pool     = require('./db');

const ai = new OpenAI({
  apiKey:  process.env.XAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});
const AI_MODEL = 'openrouter/free';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits:     { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files are accepted.'));
  },
});

function extractJsonObject(raw) {
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response.');
  return JSON.parse(raw.substring(start, end + 1));
}

function extractJsonArray(raw) {
  const arrStart = raw.indexOf('[');
  const arrEnd   = raw.lastIndexOf(']');

  if (arrStart !== -1 && arrEnd !== -1) {
    return JSON.parse(raw.substring(arrStart, arrEnd + 1));
  }

  const objStart = raw.indexOf('{');
  const objEnd   = raw.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) {
    return [JSON.parse(raw.substring(objStart, objEnd + 1))];
  }

  return [];
}

async function parseCvWithAi(rawText) {
  const systemPrompt = `You are an expert HR assistant that extracts structured data from CVs.
Return ONLY a valid JSON object — no markdown, no code fences, no extra text.
The JSON must have exactly these keys:
  "name"       : string  (full name of the candidate)
  "email"      : string  (email address, or null)
  "phone"      : string  (phone number, or null)
  "skills"     : array of strings (ONLY technical and professional skills, strictly NO hobbies or interests)
  "interests"  : array of strings (hobbies, personal interests, volunteering)
  "experience" : array of strings (job titles, companies, and work history)
  "education"  : array of strings (degrees, universities, and academic history)
  "summary"    : string  (2–4 sentence professional summary)`;

  const userPrompt = `Extract structured data from the following CV text:\n\n${rawText.slice(0, 12000)}`;

  const response = await ai.chat.completions.create({
    model:       AI_MODEL,
    messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    temperature: 0.1,
    max_tokens:  3000,
  });

  const rawContent = response.choices[0].message.content;

  try {
    return extractJsonObject(rawContent);
  } catch (err) {
    console.error('[parseCvWithAi] Failed to parse AI response:\n', rawContent);
    throw new Error('Invalid JSON format returned by AI.');
  }
}

async function searchCandidatesWithAi(candidates, query) {
  const systemPrompt = `You are an expert technical recruiter AI.
You will receive a list of candidate profiles (in JSON format) and a recruiter's search query.
CRITICAL RULES FOR MATCHING:
1. Distinguish between 'skills' (verified technical abilities) and 'interests' (hobbies/passions).
2. If the recruiter searches for a specific technology (e.g., "Blockchain" or "React"), the candidate MUST have it in their "skills" or "experience" arrays.
3. STRICTLY IGNORE candidates who only have the requested technology in their "interests" array (this is a false positive).
Return ONLY a valid JSON array — no markdown, no code fences, no extra text.
Each element must have:
  "id"         : number
  "name"       : string
  "email"      : string or null
  "phone"      : string or null
  "skills"     : array of strings
  "interests"  : array of strings
  "experience" : array of strings
  "education"  : array of strings
  "summary"    : string
  "filename"   : string or null
  "reason"     : string (1–2 sentences citing specific 'skills' or 'experience' that match the query)
Return an empty array [] if no candidates match. Rank best matches first.`;

  const userPrompt = `Recruiter's query: "${query}"\n\nCandidate Database:\n${JSON.stringify(candidates)}`;

  const response = await ai.chat.completions.create({
    model:       AI_MODEL,
    messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    temperature: 0.1,
    max_tokens:  2048,
  });

  const rawContent = response.choices[0].message.content;

  try {
    return extractJsonArray(rawContent);
  } catch (err) {
    console.error('[searchCandidatesWithAi] Failed to parse AI response:\n', rawContent);
    return [];
  }
}

function parseJsonColumn(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : (value ?? []);
  } catch {
    return [];
  }
}

function hydrateCandidate(row) {
  return {
    ...row,
    skills:     parseJsonColumn(row.skills),
    interests:  parseJsonColumn(row.interests),
    experience: parseJsonColumn(row.experience),
    education:  parseJsonColumn(row.education),
  };
}

app.post('/api/upload', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath    = req.file.path;
  const storedName  = req.file.filename;

  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const { text: rawText } = await pdfParse(pdfBuffer);

    if (!rawText || rawText.trim().length < 20) {
      return res.status(422).json({ error: 'Could not extract meaningful text from this PDF.' });
    }

    const candidate = await parseCvWithAi(rawText);

    const [result] = await pool.execute(
      `INSERT INTO candidats
         (name, email, phone, skills, interests, experience, education, summary, raw_text, filename)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        candidate.name     ?? 'Unknown',
        candidate.email    ?? null,
        candidate.phone    ?? null,
        JSON.stringify(candidate.skills     ?? []),
        JSON.stringify(candidate.interests  ?? []),
        JSON.stringify(candidate.experience ?? []),
        JSON.stringify(candidate.education  ?? []),
        candidate.summary  ?? null,
        rawText,
        storedName,
      ]
    );

    return res.status(201).json({
      message:     'Candidate saved successfully.',
      candidateId: result.insertId ?? null,
      candidate:   { ...candidate, filename: storedName },
    });

  } catch (err) {
    console.error('[POST /api/upload]', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.post('/api/search', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A search prompt is required.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, skills, interests, experience, education, summary, filename
       FROM candidats
       ORDER BY created_at DESC`
    );

    if (rows.length === 0) {
      return res.json({ matches: [], total: 0, message: 'No candidates in the database yet.' });
    }

    const candidates = rows.map(hydrateCandidate);

    const matches = await searchCandidatesWithAi(candidates, prompt.trim());

    return res.json({ matches, total: matches.length });

  } catch (err) {
    console.error('[POST /api/search]', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Server] 🚀  ATS running on http://localhost:${PORT}`);
});