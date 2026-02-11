import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const method = request.method;

    if (method === 'GET') {
      const scores: any[] = await kv.get('leaderboard') || [];
      const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      return new Response(JSON.stringify(topScores), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const { name, score } = await request.json();
      
      if (!name || score === undefined) {
        return new Response(JSON.stringify({ error: 'Missing name or score' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const date = new Date().toLocaleDateString();
      const currentScores: any[] = await kv.get('leaderboard') || [];
      
      // No more name uniqueness check as requested by Stéphane
      currentScores.push({ name, score, date });

      // Sort and keep top 10 to prevent KV bloat
      const updatedScores = currentScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      await kv.set('leaderboard', updatedScores);

      return new Response(JSON.stringify(updatedScores.slice(0, 3)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
