import Redis from 'ioredis';

// Initialisation Redis avec options de reconnexion
const redis = new Redis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: 1,
  connectTimeout: 5000,
});

export default async function handler(request: Request) {
  try {
    const method = request.method;

    if (method === 'GET') {
      let scores: any[] = [];
      try {
        const scoresRaw = await redis.get('leaderboard');
        scores = scoresRaw ? JSON.parse(scoresRaw) : [];
      } catch (redisError) {
        console.error('Redis GET error:', redisError);
        // Fallback to empty leaderboard if Redis fails
      }
      
      const topScores = scores
        .sort((a, b) => (b.score || 0) - (a.score || 0))
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
      let currentScores: any[] = [];
      
      try {
        const scoresRaw = await redis.get('leaderboard');
        currentScores = scoresRaw ? JSON.parse(scoresRaw) : [];
        
        currentScores.push({ name, score, date });

        // Sort and keep top 10 to prevent bloat
        const updatedScores = currentScores
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 10);

        await redis.set('leaderboard', JSON.stringify(updatedScores));
        currentScores = updatedScores;
      } catch (redisError) {
        console.error('Redis POST error:', redisError);
        // If Redis is down, we can't save but let's not crash the game
        // We add to local list for the immediate response if possible
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
