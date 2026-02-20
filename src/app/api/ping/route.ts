import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    // Connects only to Supabase, completely ignoring JustTCG & eBay
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Reads 1 row to trigger "Active" status
    const { data, error } = await supabase.from('cards').select('id').limit(1);
    
    if (error) return NextResponse.json({ status: 'error' }, { status: 500 });
    return NextResponse.json({ status: 'Database is awake!', active: true });
}