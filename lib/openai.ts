import OpenAI from 'openai';

const apiKey = process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
});

export const SYSTEM_PROMPT = `You are DataProFlow Support AI agent, a helpful and friendly customer support assistant for DataProFlow - a marketing analytics platform that helps users connect their social media accounts (Instagram, Facebook, TikTok) and visualize data in Google Sheets, Looker Studio, and other destinations.

You can answer questions about:
- Connecting and authenticating data sources (Instagram, Facebook, TikTok)
- Required permissions and API keys
- Setting up and running queries
- Troubleshooting connection or data issues
- Using DataProFlow with Google Sheets, Looker Studio, Power BI, and more
- Managing accounts, tokens, and report templates
- Refreshing account data and reauthenticating connections

Guidelines:
1. Be concise, friendly, and professional
2. If you don't know the answer or the question is outside your scope, politely say so and offer to connect them with a human agent
3. For billing, subscription, or account-specific issues, recommend talking to a human agent
4. Keep responses brief but helpful - users prefer quick answers
5. Use bullet points for step-by-step instructions
6. If the user seems frustrated or asks to speak to a human, respect their request immediately

When you cannot help, respond with: "Sorry I couldn't answer your question. You can rephrase your question or have assistance from my human colleagues."

Remember: You represent DataProFlow, so maintain a professional and helpful tone at all times.`;

// Common responses cache - reduces API calls for frequently asked questions
const CACHED_RESPONSES: Record<string, string> = {
  // Greetings
  'hello': 'Hi there! 👋 How can I help you with DataProFlow today?',
  'hi': 'Hello! 👋 How can I assist you with DataProFlow today?',
  'hey': 'Hey there! 👋 What can I help you with today?',
  
  // Common questions
  'how do i connect instagram': 'To connect Instagram to DataProFlow:\n\n1. Go to **Connections** in your dashboard\n2. Click **Add Connection** and select Instagram\n3. Log in with your Instagram Business account\n4. Grant the required permissions\n5. Your data will start syncing automatically\n\nNote: You need an Instagram Business or Creator account linked to a Facebook Page.',
  
  'how do i connect facebook': 'To connect Facebook to DataProFlow:\n\n1. Navigate to **Connections** in your dashboard\n2. Click **Add Connection** and select Facebook\n3. Log in with your Facebook account\n4. Select the Pages you want to connect\n5. Grant the required permissions\n\nYour Facebook data will start syncing within a few minutes.',
  
  'how to refresh data': 'To refresh your data in DataProFlow:\n\n1. Go to your **Dashboard**\n2. Find the connection you want to refresh\n3. Click the **Refresh** button (🔄 icon)\n\nData typically refreshes automatically every few hours, but you can manually refresh anytime.',
  
  'pricing': 'For detailed pricing information, please visit our Pricing page at dataproflow.com/pricing or contact our sales team. Would you like me to connect you with a human agent to discuss pricing options?',
  
  'cancel subscription': 'To cancel your subscription, please contact our support team directly. I can connect you with a human agent who can help with billing and subscription changes. Would you like me to do that?',
  
  'talk to human': 'Of course! Click the **"Talk to a human"** button below to connect with our support team. They\'ll be happy to assist you.',
  
  'speak to agent': 'Absolutely! Click the **"Talk to a human"** button below and fill out the form. Our team will get back to you shortly.',
  
  'thanks': 'You\'re welcome! 😊 Is there anything else I can help you with?',
  'thank you': 'You\'re welcome! 😊 Let me know if you need any more help.',
  'bye': 'Goodbye! 👋 Feel free to come back anytime you need assistance.',
  'goodbye': 'Take care! 👋 We\'re here whenever you need help.',
};

// Normalize message for cache lookup
function normalizeMessage(message: string): string {
  return message.toLowerCase().trim().replace(/[?!.,]/g, '');
}

// Check if message matches a cached response
function getCachedResponse(message: string): string | null {
  const normalized = normalizeMessage(message);
  
  // Only direct/exact match - no partial matching to avoid wrong responses
  if (CACHED_RESPONSES[normalized]) {
    return CACHED_RESPONSES[normalized];
  }
  
  // Check for very short greetings only (1-2 words)
  const words = normalized.split(' ');
  if (words.length <= 2) {
    for (const [key, response] of Object.entries(CACHED_RESPONSES)) {
      if (normalized === key) {
        return response;
      }
    }
  }
  
  return null;
}

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): Promise<string> {
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    return "I'm currently unavailable. Please try again later or contact support.";
  }

  // Check for cached response first (only for single user messages)
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === 'user' && messages.length <= 2) {
    const cachedResponse = getCachedResponse(lastMessage.content);
    if (cachedResponse) {
      console.log('Using cached response for:', lastMessage.content);
      return cachedResponse;
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300, // Reduced from 500 to save costs
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request. Please try again.";
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };
    console.error('OpenAI API error:', {
      status: err.status,
      message: err.message,
      code: err.code,
    });
    
    if (err.status === 401) {
      return "I'm currently unavailable due to a configuration issue. Please contact support.";
    }
    if (err.status === 429) {
      return "I'm receiving too many requests right now. Please try again in a moment.";
    }
    
    return "I'm sorry, I encountered an error. Please try again or contact support.";
  }
}

export default openai;
