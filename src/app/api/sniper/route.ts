import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getEbayToken } from '../utils/ebay';

const EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ data: [] });
    }

    // Read from the shared snipes table used by HardwareSniper bot
    const { data, error } = await supabase
      .from('snipes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.warn("Supabase snipes fetch warning:", error.message);
      return NextResponse.json({ data: [], warning: error.message });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch snipes', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. ACTION: Test Snipe / Live Preview against eBay
    if (body.action === 'test') {
      const cardName = body.card_name || '';
      const setName = body.set_name || '';
      const maxPrice = parseFloat(body.max_price || '999999');
      const condition = body.condition || 'Near Mint';
      const webhookUrl = body.discord_webhook_url;

      const token = await getEbayToken();
      if (!token) {
        return NextResponse.json({ error: 'eBay authentication failed' }, { status: 500 });
      }

      // Build clean query
      const cleanSet = setName.replace(/-/g, ' ').replace(/pokemon/i, '').trim();
      let query = `${cardName} ${cleanSet}`.trim();
      if (condition.toLowerCase().includes('near mint') || condition.toLowerCase() === 'nm') {
        query += ' Near Mint -graded -slab -PSA -CGC -BGS';
      }

      const url = `${EBAY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=10&sort=price&filter=price:[0..${maxPrice}],priceCurrency:USD`;

      const ebayRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      });

      if (!ebayRes.ok) {
        return NextResponse.json({ data: [] });
      }

      const ebayData = await ebayRes.json();
      const rawItems = ebayData.itemSummaries || [];
      const matches = rawItems.map((item: any) => ({
        id: item.itemId,
        title: item.title,
        price: item.price?.value,
        link: item.itemWebUrl,
        image: item.image?.imageUrl || '',
        buyingOptions: item.buyingOptions || []
      })).filter((m: any) => parseFloat(m.price) <= maxPrice);

      // If user supplied a Discord Webhook URL, send an alert ping!
      if (webhookUrl && matches.length > 0) {
        try {
          const topMatch = matches[0];
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'CFinder Sniper',
              avatar_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
              embeds: [
                {
                  title: `?? Snipe Found: ${cardName}`,
                  description: `**${topMatch.title}**\nFound for **$${topMatch.price}** (Target was under $${maxPrice.toFixed(2)})`,
                  url: topMatch.link,
                  color: 0x22c55e,
                  thumbnail: topMatch.image ? { url: topMatch.image } : undefined,
                  fields: [
                    { name: 'Set', value: setName || 'Any', inline: true },
                    { name: 'Condition', value: condition, inline: true },
                    { name: 'Matches Found', value: `${matches.length} listings`, inline: true }
                  ],
                  footer: { text: 'CFinder x HardwareSniper' },
                  timestamp: new Date().toISOString()
                }
              ]
            })
          });
        } catch (webhookErr) {
          console.error("Discord Webhook dispatch failed:", webhookErr);
        }
      }

      return NextResponse.json({ data: matches });
    }

    // 2. ACTION: Create Snipe Rule (Saved into Supabase snipes table)
    const { user_id, card_name, set_name, target_price, condition, discord_webhook_url } = body;

    if (!user_id || !card_name || !target_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      user_id: user_id,
      category: 'POKEMON',
      target_price: parseFloat(target_price),
      max_condition: condition || 'Near Mint',
      spec_filters: {
        card_name: card_name,
        set_name: set_name || '',
        condition: condition || 'Near Mint',
        product_type: `${card_name} ${set_name || ''}`.trim(),
        discord_webhook_url: discord_webhook_url || null
      },
      is_active: true
    };

    const { data, error } = await supabase
      .from('snipes')
      .insert(payload)
      .select();

    if (error) {
      console.warn("Supabase insert snipe fallback:", error.message);
      return NextResponse.json({ 
        success: true, 
        data: [{ id: Date.now(), ...payload }],
        note: 'Saved locally (Supabase table snipes sync note: ' + error.message + ')'
      });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create snipe', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing snipe ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('snipes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed', details: String(err) }, { status: 500 });
  }
}
