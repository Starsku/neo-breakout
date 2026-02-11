import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || '');

export default async function handler(request: Request) {
  try {
    const method = request.method;

    if (method === 'GET') {
      const scoresRaw = await redis.get('leaderboard');
      const scores: any[] = scoresRaw ? JSON.parse(scoresRaw) : [];
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
      const scoresRaw = await redis.get('leaderboard');
      const currentScores: any[] = scoresRaw ? JSON.parse(scoresRaw) : [];
      
      currentScores.push({ name, score, date });

      // Sort and keep top 10 to prevent bloat
      const updatedScores = currentScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      await redis.set('leaderboard', JSON.stringify(updatedScores));

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
