/**
 * DeepSeek AI Agent
 * 
 * Core AI agent logic for conversational booking using DeepSeek's API.
 * Uses a standard OpenAI-compatible fetch interface for high reliability.
 * Handles recommendations, vendor swapping, and conversation memory.
 */

import type {
    ChatMessage,
    Recommendation,
    ConversationContext,
    GolfCourse,
    Hotel,
    TravelPackage
} from '@/types';

// System prompt for the golf tourism assistant
const SYSTEM_PROMPT = `You are a friendly and knowledgeable Golf Tourism Assistant. You are part of an integrated app where users can browse Golf Courses, Hotels, and Travel Packages manually, or ask you for intelligent end-to-end planning.

Your primary goal is to help users plan complete golf vacation experiences.

End-to-End Planning capabilities:
1. Coordinate a multi-item trip: find a course, a nearby hotel, and transport in one session.
2. Provide holistic recommendations that consider proximity between all items (e.g., "This hotel is only 5 minutes from the golf course I recommended").
3. Update specific parts of a plan while keeping others (Vendor Swapping).

Discovery Categories:
- Golf: Recommend specific courses based on skill level and scenic preferences.
- Hotels: Recommend golf resorts or nearby luxury/budget accommodations.
- Travel: Recommend airport transfers and local sightseeing tours.

When a user asks for an "end-to-end" plan or seems to be planning a full trip, provide options for all three categories that work well together.

For booking, collect:
- Dates, number of guests, and location preferences.

Always format recommendations clearly so they can be parsed into visual cards by the frontend. Include Name, Price, Rating, and Proximity.`;

/**
 * Format chat history for DeepSeek (OpenAI compatible)
 */
function formatMessages(userMessage: string, history: ChatMessage[], systemContext: string) {
    const messages = [
        { role: 'system', content: systemContext },
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }))
    ];

    // Add the latest message if not already in history
    if (history.length === 0 || history[history.length - 1].content !== userMessage) {
        messages.push({ role: 'user', content: userMessage });
    }

    return messages;
}

/**
 * Generate AI response using DeepSeek
 */
export async function generateAIResponse(
    userMessage: string,
    conversationHistory: ChatMessage[],
    context: ConversationContext,
    availableData?: {
        golfCourses?: GolfCourse[];
        hotels?: Hotel[];
        travelPackages?: TravelPackage[];
    }
): Promise<{ response: string; recommendations?: Recommendation[]; updatedContext?: Partial<ConversationContext> }> {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('CRITICAL: DEEPSEEK_API_KEY is missing from environment variables.');
            throw new Error('DeepSeek API key not configured');
        }

        // Build context-aware prompt
        let contextInfo = '';
        if (context.current_booking) {
            contextInfo += `\n\nCurrent booking in progress: ${JSON.stringify(context.current_booking)}`;
        }
        if (context.preferences_extracted) {
            contextInfo += `\n\nUser preferences: ${JSON.stringify(context.preferences_extracted)}`;
        }
        if (availableData) {
            if (availableData.golfCourses?.length) {
                contextInfo += `\n\nAvailable golf courses:\n${JSON.stringify(availableData.golfCourses.slice(0, 10), null, 2)}`;
            }
            if (availableData.hotels?.length) {
                contextInfo += `\n\nAvailable hotels:\n${JSON.stringify(availableData.hotels.slice(0, 10), null, 2)}`;
            }
            if (availableData.travelPackages?.length) {
                contextInfo += `\n\nAvailable travel packages:\n${JSON.stringify(availableData.travelPackages.slice(0, 10), null, 2)}`;
            }
        }

        const fullSystemPrompt = `${SYSTEM_PROMPT}${contextInfo}`;
        const messages = formatMessages(userMessage, conversationHistory, fullSystemPrompt);

        // Fetch from DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        // Extract recommendations if present in response
        const recommendations = extractRecommendations(aiText, availableData);

        // Update context based on conversation
        const updatedContext = updateContextFromConversation(userMessage, aiText, context);

        return {
            response: aiText,
            recommendations: recommendations.length > 0 ? recommendations : undefined,
            updatedContext,
        };
    } catch (error: any) {
        console.error('DeepSeek AI Error Detailed:', {
            message: error.message,
            stack: error.stack,
        });
        return {
            response: `I apologize, but I'm having trouble processing your request via DeepSeek. (Error: ${error.message || 'Unknown'}). Please ensure your DEEPSEEK_API_KEY is valid and has credits.`,
        };
    }
}

/**
 * Extract recommendations from AI response
 */
function extractRecommendations(
    response: string,
    availableData?: {
        golfCourses?: GolfCourse[];
        hotels?: Hotel[];
        travelPackages?: TravelPackage[];
    }
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!availableData) return recommendations;

    // Match mentioned items from available data
    const responseLower = response.toLowerCase();

    // Check golf courses
    availableData.golfCourses?.forEach((course) => {
        if (responseLower.includes(course.name.toLowerCase())) {
            recommendations.push({
                type: 'golf',
                item_id: course.id,
                name: course.name,
                description: course.description || '',
                price: course.price_range?.min || 0,
                rating: course.rating || 0,
                image_url: course.images?.[0],
                category: determineCategory(course),
            });
        }
    });

    // Check hotels
    availableData.hotels?.forEach((hotel) => {
        if (responseLower.includes(hotel.name.toLowerCase())) {
            recommendations.push({
                type: 'hotel',
                item_id: hotel.id,
                name: hotel.name,
                description: hotel.description || '',
                price: 0,
                rating: hotel.star_rating || 0,
                image_url: hotel.images?.[0],
                category: 'rating',
            });
        }
    });

    // Check travel packages
    availableData.travelPackages?.forEach((pkg) => {
        if (responseLower.includes(pkg.name.toLowerCase())) {
            recommendations.push({
                type: 'travel',
                item_id: pkg.id,
                name: pkg.name,
                description: pkg.description || '',
                price: pkg.price,
                rating: 0,
                category: 'price',
            });
        }
    });

    return recommendations;
}

/**
 * Determine recommendation category
 */
function determineCategory(item: GolfCourse): 'price' | 'rating' | 'proximity' {
    if (item.rating && item.rating >= 4.5) return 'rating';
    if (item.price_range?.min && item.price_range.min < 100) return 'price';
    return 'proximity';
}

/**
 * Update conversation context based on new messages
 */
function updateContextFromConversation(
    userMessage: string,
    aiResponse: string,
    currentContext: ConversationContext
): Partial<ConversationContext> {
    const updates: Partial<ConversationContext> = {};
    const messageLower = userMessage.toLowerCase();

    // Extract date preferences
    const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
        /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    ];

    for (const pattern of datePatterns) {
        if (pattern.test(messageLower)) {
            updates.current_booking = {
                ...currentContext.current_booking,
            };
            break;
        }
    }

    // Detect booking stage
    if (messageLower.includes('book') || messageLower.includes('reserve')) {
        updates.booking_stage = 'selecting';
    } else if (messageLower.includes('confirm') || messageLower.includes('yes')) {
        updates.booking_stage = 'confirming';
    }

    return updates;
}
