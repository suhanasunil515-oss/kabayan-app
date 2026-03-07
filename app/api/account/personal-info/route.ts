import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', parseInt(userId))
      .single();

    if (error) {
      console.error('[v0] User query error:', error);
      return NextResponse.json({ info: null }, { status: 404 });
    }

    // Parse contact persons if they exist
    let contactPerson1 = { name: '', phone: '', relationship: 'Family' };
    let contactPerson2 = { name: '', phone: '', relationship: 'Family' };
    
    try {
      if (data.contact_person1 && typeof data.contact_person1 === 'string') {
        contactPerson1 = JSON.parse(data.contact_person1);
      } else if (data.contact_person1 && typeof data.contact_person1 === 'object') {
        contactPerson1 = data.contact_person1;
      }
      
      if (data.contact_person2 && typeof data.contact_person2 === 'string') {
        contactPerson2 = JSON.parse(data.contact_person2);
      } else if (data.contact_person2 && typeof data.contact_person2 === 'object') {
        contactPerson2 = data.contact_person2;
      }
    } catch (e) {
      console.error('[v0] Error parsing contact persons:', e);
    }

    // Try to fetch personal_info from loan application if needed
    let info = data;
    if (!info.full_name || info.full_name === info.phone_number) {
      try {
        const { data: loanApp, error: loanError } = await supabaseAdmin
          .from('loan_applications')
          .select('personal_info')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (loanApp?.personal_info && typeof loanApp.personal_info === 'object') {
          const personalInfo = loanApp.personal_info as any;
          info = {
            ...info,
            full_name: personalInfo.full_name || info.full_name,
            id_card_number: personalInfo.id_card_number || info.id_card_number,
            date_of_birth: personalInfo.date_of_birth || info.date_of_birth,
            gender: personalInfo.gender || info.gender,
            living_address: personalInfo.living_address || info.living_address,
            loan_purpose: personalInfo.loan_purpose || info.loan_purpose,
          };
        }
      } catch (e) {
        console.error('[v0] Error fetching loan application personal info:', e);
      }
    }

    // Transform data to match new format
    const transformedInfo = {
      full_name: info.full_name || '',
      id_card_number: info.id_card_number || '',
      gender: info.gender || '',
      date_of_birth: info.date_of_birth || '',
      current_job: info.position || '', // Map position to current_job
      stable_income: info.monthly_income || '', // Map monthly_income to stable_income
      loan_purpose: info.loan_purpose || '',
      living_address: info.living_address || '',
      relative_name: contactPerson1.name || '',
      relative_phone: contactPerson1.phone || '',
      // Include original fields for backward compatibility
      facebook_name: info.facebook_name || '',
      company_name: info.company_name || '',
      position: info.position || '',
      seniority: info.seniority || '',
      monthly_income: info.monthly_income || '',
      unit_address: info.unit_address || '',
      contact_person1: info.contact_person1,
      contact_person2: info.contact_person2,
    };

    return NextResponse.json({ info: transformedInfo });
  } catch (error) {
    console.error('[v0] Personal info GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[v0] Updating personal info for user:', userId, body);

    // Create contact person objects
    const contactPerson1 = {
      name: body.relative_name || '',
      phone: body.relative_phone || '',
      relationship: 'Family'
    };

    // Keep existing contact_person2 if needed
    let contactPerson2 = { name: '', phone: '', relationship: 'Family' };
    
    // Try to fetch existing contact_person2 to preserve it
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('contact_person2')
      .eq('id', parseInt(userId))
      .single();
    
    if (existingUser?.contact_person2) {
      try {
        if (typeof existingUser.contact_person2 === 'string') {
          contactPerson2 = JSON.parse(existingUser.contact_person2);
        } else {
          contactPerson2 = existingUser.contact_person2;
        }
      } catch (e) {
        console.error('[v0] Error parsing existing contact_person2:', e);
      }
    }

    const updateData: any = {
      // New fields
      full_name: body.full_name,
      id_card_number: body.id_card_number,
      gender: body.gender,
      date_of_birth: body.date_of_birth,
      living_address: body.living_address,
      loan_purpose: body.loan_purpose,
      
      // Map to existing fields for backward compatibility
      position: body.current_job, // Map current_job to position
      monthly_income: body.stable_income, // Map stable_income to monthly_income
      
      // Keep existing fields that we're not using in new form
      facebook_name: body.facebook_name || '',
      company_name: body.company_name || '',
      seniority: body.seniority || '',
      unit_address: body.unit_address || '',
      
      // Update contact person 1 with relative info
      contact_person1: JSON.stringify(contactPerson1),
      
      // Preserve contact_person2
      contact_person2: JSON.stringify(contactPerson2),
      
      // Mark as completed
      personal_info_completed: true,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', parseInt(userId))
      .select()
      .single();

    if (error) {
      console.error('[v0] Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[v0] Personal info updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Personal information updated successfully',
      info: data,
    });
  } catch (error) {
    console.error('[v0] Personal info PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
