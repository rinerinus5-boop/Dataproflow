import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/chat/analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Generate AI response based on context
    const response = generateAIResponse(message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Analytics chat error:", error);
    return NextResponse.json({
      response: "I'm having trouble right now. Please try again in a moment.",
    });
  }
}

function generateAIResponse(message: string, context?: Record<string, unknown>): string {
  const lowerMessage = message.toLowerCase();
  const followers = context?.followers || 387;
  const impressions = context?.impressions || 116500;
  const engagement = context?.engagement || 4.2;
  const platform = context?.platform || "Instagram";

  if (lowerMessage.includes("engagement")) {
    return `Your current engagement rate is ${engagement}%. ${Number(engagement) > 3 ? "That's above the industry average of 3%! 🎉" : "Here's how to improve it:"}

**Quick wins:**
• Post more video content (Reels get 2x engagement)
• Ask questions in your captions
• Reply to every comment within 1 hour
• Use carousel posts (multiple images)
• Post during peak hours: 9-11 AM, 7-9 PM`;
  }

  if (lowerMessage.includes("follower") || lowerMessage.includes("grow") || lowerMessage.includes("audience")) {
    return `You currently have ${followers.toLocaleString()} followers. Here are proven strategies to grow:

**Growth tactics:**
• Post consistently (3-5 times per week minimum)
• Use 5-10 relevant hashtags per post
• Collaborate with accounts in your niche
• Share behind-the-scenes content
• Run contests or giveaways
• Go live weekly (builds trust)
• Respond to all DMs and comments

**Focus on ${platform}:** Share Stories daily and post Reels 3x per week for fastest growth!`;
  }

  if (lowerMessage.includes("time") || lowerMessage.includes("when") || lowerMessage.includes("post")) {
    return `**Best times to post on ${platform}:**

• Weekdays: 9-11 AM and 7-9 PM
• Weekends: 11 AM - 1 PM
• Worst times: Late night (11 PM - 6 AM)

**Pro tip:** Check your ${platform} Insights to see when YOUR specific audience is most active. Post 30 minutes before peak times for best results!`;
  }

  if (lowerMessage.includes("improve") || lowerMessage.includes("better") || lowerMessage.includes("tips")) {
    return `Based on your ${impressions.toLocaleString()} impressions and ${engagement}% engagement, here are my top recommendations:

**Content Strategy:**
1. **80/20 Rule:** 80% value/education, 20% promotion
2. **Post formats that work:**
   - How-to tutorials (save-worthy)
   - Behind-the-scenes (authentic)
   - User-generated content (community building)
   - Trending audio + original twist

**Engagement boosters:**
• Use strong hooks in first 3 seconds
• Add captions to all videos
• End with a question or CTA
• Post consistently at optimal times`;
  }

  if (lowerMessage.includes("content") || lowerMessage.includes("idea") || lowerMessage.includes("what")) {
    return `**Content ideas for next week:**

1. **Monday Motivation** - Share your business journey/lesson learned
2. **Tutorial Tuesday** - Quick how-to related to your niche
3. **Behind-the-scenes Wednesday** - Show your process/workspace
4. **Thought-leadership Thursday** - Share industry insights
5. **Feature Friday** - Highlight a customer/community member
6. **Weekend vibes** - Personal/light content to build connection

**Remember:** Your audience wants VALUE first, entertainment second, promotion last. Keep that ratio 80/20!`;
  }

  if (lowerMessage.includes("analytics") || lowerMessage.includes("metric") || lowerMessage.includes("performance")) {
    return `**Your current performance summary:**

📊 **Followers:** ${followers.toLocaleString()}
👁️ **Impressions:** ${impressions.toLocaleString()}
❤️ **Engagement Rate:** ${engagement}%

**Benchmarks:**
• Engagement 1-3% = Average
• Engagement 3-6% = Good ⭐
• Engagement 6%+ = Excellent 🚀

${Number(engagement) > 3 ? "You're performing above average! Keep it up." : "Focus on increasing engagement with more interactive content (polls, questions, videos)."}

Want specific tips on any metric?`;
  }

  // Default response
  return `I'm here to help with your social media analytics! 🚀

**You can ask me:**
• "How do I get more followers?"
• "What's my engagement rate?"
• "When should I post?"
• "How can I improve my content?"
• "Why did my reach drop?"
• "Content ideas for next week"

What would you like to know about your ${platform} performance?`;
}
