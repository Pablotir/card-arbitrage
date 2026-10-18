import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Only allow http/https
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return new NextResponse('Invalid url', { status: 400 });
    }

    // Generate fallback variant URLs to test if primary fetch fails
    const urlsToTry = [imageUrl];
    if (imageUrl.endsWith('/high.webp')) {
      urlsToTry.push(imageUrl.replace('/high.webp', '/low.webp'));
    }
    if (imageUrl.includes('_hires.png')) {
      urlsToTry.push(imageUrl.replace('_hires.png', '.png'));
    }
    if (imageUrl.includes('/ja/SM/')) {
      urlsToTry.push(imageUrl.replace('/ja/SM/', '/ja/sm/'));
    } else if (imageUrl.includes('/ja/sm/')) {
      urlsToTry.push(imageUrl.replace('/ja/sm/', '/ja/SM/'));
    }

    let res: Response | null = null;
    for (const url of urlsToTry) {
      try {
        const attempt = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        if (attempt.ok) {
          res = attempt;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!res || !res.ok) {
      return new NextResponse('Image fetch failed', { status: res?.status || 404 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      }
    });
  } catch (error) {
    return new NextResponse('Proxy error', { status: 500 });
  }
}
