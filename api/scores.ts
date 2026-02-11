import { Redis } from '@upstash/redis';

// Initialisation Upstash Redis (compatible Edge Runtime)
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '', // Upstash nécessite souvent un token séparé ou inclus dans l'URL
});

// Note: Si REDIS_URL contient déjà les credentials au format Upstash (https://...), 
// Redis.fromEnv() pourrait aussi être utilisé.

export default async function handler(request: Request) {
  try {
    const method = request.method;

    if (method === 'GET') {
      let scores: any[] = [];
      try {
        const scoresRaw = await redis.get('leaderboard');
        // Upstash redis.get() renvoie déjà l'objet parsé si c'est du JSON
        scores = typeof scoresRaw === 'string' ? JSON.parse(scoresRaw) : (scoresRaw || []);
      } catch (redisError) {
        console.error('Redis GET error:', redisError);
      }
      
      const topScores = Array.isArray(scores) 
        ? scores.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)
        : [];
      
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
      let currentScores: any[] = [];
      
      try {
        const scoresRaw = await redis.get('leaderboard');
        currentScores = typeof scoresRaw === 'string' ? JSON.parse(scoresRaw) : (scoresRaw || []);
        
        if (!Array.isArray(currentScores)) currentScores = [];
        
        currentScores.push({ name, score, date });

        const updatedScores = currentScores
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 10);

        await redis.set('leaderboard', JSON.stringify(updatedScores));
        currentScores = updatedScores;
      } catch (redisError) {
        console.error('Redis POST error:', redisError);
        currentScores.push({ name, score, date });
        currentScores.sort((a, b) => b.score - a.score);
      }

      return new Response(JSON.stringify(currentScores.slice(0, 3)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('API scores handler error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
