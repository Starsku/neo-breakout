import { Redis } from '@upstash/redis';

// Diagnostic log for REDIS_URL
console.log("REDIS_URL starts with:", process.env.REDIS_URL?.substring(0, 10));

let redis: Redis;

try {
  // Upstash/redis requires a URL starting with https:// for the REST API.
  // If REDIS_URL starts with redis://, it's a TCP connection string (standard Redis).
  const redisUrl = process.env.REDIS_URL || '';
  
  if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
    console.warn("WARNING: REDIS_URL uses redis:// protocol but @upstash/redis expects https:// (REST).");
    // We attempt to initialize it anyway, but @upstash/redis will likely fail if it's not a URL it understands.
  }

  redis = new Redis({
    url: redisUrl,
    token: process.env.REDIS_TOKEN || '',
  });

  // Test connection
  (async () => {
    try {
      const pong = await redis.ping();
      console.log("Redis PING result:", pong);
    } catch (pingError) {
      console.error("Redis PING failed during initialization:", pingError);
    }
  })();

} catch (initError) {
  console.error("Global Redis initialization error:", initError);
}

export default async function handler(request: Request) {
  try {
    const method = request.method;

    if (method === 'GET') {
      let scores: any[] = [];
      try {
        if (!redis) throw new Error("Redis client not initialized");
        const scoresRaw = await redis.get('leaderboard');
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
        if (!redis) throw new Error("Redis client not initialized");
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
