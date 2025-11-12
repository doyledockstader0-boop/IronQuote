import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limiter';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerInfo, buildingType, totalSqFt, frequency, monthlyTotal } = body;

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create the prompt for Claude
    const prompt = `You are a professional proposal writer for a commercial cleaning company called JanPro. 

Generate professional proposal content for the following cleaning project:

Customer: ${customerInfo.firstName} ${customerInfo.lastName}
Business: ${customerInfo.businessName}
Facility Type: ${buildingType}
Total Square Feet: ${totalSqFt}
Cleaning Frequency: ${frequency}x per week
Monthly Investment: $${monthlyTotal}

Please provide three sections:

1. INTRODUCTION (2-3 sentences): A warm, professional greeting and thank you for considering our services. Mention their specific facility type and our relevant expertise.

2. SERVICE DESCRIPTION (2-3 sentences): Describe the cleaning services we'll provide, emphasizing the frequency, coverage area, and our professional approach. Mention our MedMetrix certification if it's a medical facility.

3. VALUE PROPOSITION (2-3 sentences): Explain why they should choose JanPro - mention our experience, certifications, quality standards, and commitment to creating healthy environments.

Write in a professional but approachable tone. Be specific about their facility. Keep each section concise and compelling.

Format your response as JSON with these exact keys:
{
  "introduction": "...",
  "serviceDescription": "...",
  "valueProposition": "..."
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to generate content' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the text content from Claude's response
    let responseText = data.content[0].text;
    
    // Clean up any markdown code blocks
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    const content = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      content: {
        introduction: content.introduction,
        serviceDescription: content.serviceDescription,
        valueProposition: content.valueProposition,
      },
    });

  } catch (error) {
    console.error('Error in generate-proposal API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}