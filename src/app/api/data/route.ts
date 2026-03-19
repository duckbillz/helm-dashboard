import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const REDIS_KEY = 'helm-dashboard-data';

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ data: null, error: 'Redis not configured' }, { status: 503 });
  }
  try {
    const data = await redis.get(REDIS_KEY);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Redis GET error:', err);
    return NextResponse.json({ data: null, error: 'Failed to read' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }
  try {
    const body = await request.json();
    await redis.set(REDIS_KEY, JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Redis PUT error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
