import Redis from 'ioredis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Diagnostic log for REDIS_URL
console.log("REDIS_URL starts with:", process.env.REDIS_URL?.substring(0, 10));

const redisUrl = process.env.REDIS_URL || '';
let redis: Redis | null = null;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl);
    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  } catch (error) {
    console.error('Redis Connection Error:', error);
  }
} else {
  console.error('REDIS_URL is not defined');
}

/**
 * Basic XSS cleanup for names
 */
function sanitizeName(name: string): string {
  if (!name) return 'Anonymous';
  return name.replace(/[<>]/g, '').substring(0, 15);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const method = req.method;

    if (method === 'GET') {
      let scores: any[] = [];
      try {
        if (!redis) throw new Error("Redis client not initialized");
        const scoresRaw = await redis.get('leaderboard');
        scores = scoresRaw ? JSON.parse(scoresRaw) : [];
      } catch (redisError) {
        console.error('Redis GET error:', redisError);
      }
      
      const topScores = Array.isArray(scores) 
        ? scores.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)
        : [];
      
      return res.status(200).json(topScores);
    }

    if (method === 'POST') {
      const { name, score } = req.body;
      
      if (!name || score === undefined) {
        return res.status(400).json({ error: 'Missing name or score' });
      }

      const cleanName = sanitizeName(name);
      const date = new Date().toLocaleDateString();
      let currentScores: any[] = [];
      
      try {
        if (!redis) throw new Error("Redis client not initialized");
        const scoresRaw = await redis.get('leaderboard');
        currentScores = scoresRaw ? JSON.parse(scoresRaw) : [];
        
        if (!Array.isArray(currentScores)) currentScores = [];
        
        currentScores.push({ name: cleanName, score: Number(score), date });

        const updatedScores = currentScores
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 10);

        await redis.set('leaderboard', JSON.stringify(updatedScores));
        currentScores = updatedScores;
      } catch (redisError) {
        console.error('Redis POST error:', redisError);
        // Temporary fallback if redis fails
        currentScores.push({ name: cleanName, score: Number(score), date });
        currentScores.sort((a, b) => b.score - a.score);
      }

      return res.status(200).json(currentScores.slice(0, 3));
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API scores handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
