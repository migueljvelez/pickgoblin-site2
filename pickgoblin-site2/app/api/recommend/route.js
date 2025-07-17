import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TMDB_API_KEY = '46e3955a247c74030ec7bcf47ab904e1';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Enriquecer cada recomendación con poster desde TMDb
async function enrichWithPosters(items) {
  const enriched = await Promise.all(items.map(async (item) => {
    const query = encodeURIComponent(item.title);
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${TMDB_API_KEY}`);
    const tmdbData = await tmdbRes.json();
    
    const result = tmdbData.results?.[0];
    const posterPath = result?.poster_path;

    return {
      ...item,
      poster: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null
    };
  }));

  return enriched;
}

export async function POST(req) {
  const body = await req.json();
  const { emotions, goal, tastes, type = 'movie', platform = 'all', quantity = '5' } = body;

  if (!emotions || !goal || !tastes) {
    return new Response(JSON.stringify({ error: 'Missing required input fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a recommendation engine specialized in films and series. Always return 5 results as an array of objects.
Each result must include: title, type (movie or series), description, trailer (YouTube URL), and platforms (array of strings).
Rules:
- 2 suggestions must be mainstream, trending or viral
- 2 suggestions must be lesser-known or hidden gems
- 1 must be daring, edgy, weird, or conversation-starting
- Respond in raw JSON format. No commentary.`
        },
        {
          role: 'user',
          content: `Mood: ${emotions}
Goal: ${goal}
Tastes: ${tastes}
Platform: ${platform}
Type: ${type}`
        }
      ],
      temperature: 0.8
    });

    const content = completion.choices[0].message.content;
    console.log("GPT Response:", content);

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON from OpenAI',
        raw: content
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const items = parsed?.results || parsed?.recommendations || parsed;

    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Parsed result is not an array.', raw: parsed }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const enriched = await enrichWithPosters(items);

    return new Response(JSON.stringify({ recommendations: enriched }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message || 'Something went wrong.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
