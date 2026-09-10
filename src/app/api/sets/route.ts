import { NextResponse } from 'next/server';
import { getTcgdexSets } from '@/lib/tcgdex';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'pokemon';

    if (game === 'pokemon') {
      const sets = await getTcgdexSets();
      return NextResponse.json({ data: sets });
    }

    // For One Piece, return popular known sets or fallback
    const onePieceSets = [
      { id: 'op-09', name: 'OP-09 Emperors in the New World', isRecent: true },
      { id: 'op-08', name: 'OP-08 Two Legends', isRecent: true },
      { id: 'op-07', name: 'OP-07 500 Years in the Future' },
      { id: 'op-06', name: 'OP-06 Wings of the Captain' },
      { id: 'op-05', name: 'OP-05 Awakening of the New Era' },
      { id: 'op-04', name: 'OP-04 Kingdoms of Intrigue' },
      { id: 'op-03', name: 'OP-03 Pillars of Strength' },
      { id: 'op-02', name: 'OP-02 Paramount War' },
      { id: 'op-01', name: 'OP-01 Romance Dawn' },
      { id: 'eb-01', name: 'Extra Booster: Memorial Collection' }
    ];

    return NextResponse.json({ data: onePieceSets });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch sets', details: String(err) }, { status: 500 });
  }
}
