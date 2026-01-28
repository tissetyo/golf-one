/**
 * Gemini AI Agent
 * 
 * Core AI agent logic for conversational booking using Google's Gemini API.
 * Handles recommendations, vendor swapping, and conversation memory.
 */

import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import type {
    ChatMessage,
    Recommendation,
    ConversationContext,
    GolfCourse,
    Hotel,
    TravelPackage
} from '@/types';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
 * Format chat history for Gemini API
 */
function formatChatHistory(messages: ChatMessage[]): Content[] {
    return messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }] as Part[],
    }));
}

/**
 * Generate AI response using Gemini
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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

        // Start chat with system context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `System context: ${SYSTEM_PROMPT}${contextInfo}` }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m ready to help with golf tourism bookings and recommendations.' }],
                },
                ...formatChatHistory(conversationHistory),
            ],
        });

        // Generate response
        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();

        // Extract recommendations if present in response
        const recommendations = extractRecommendations(response, availableData);

        // Update context based on conversation
        const updatedContext = updateContextFromConversation(userMessage, response, context);

        return {
            response,
            recommendations: recommendations.length > 0 ? recommendations : undefined,
            updatedContext,
        };
    } catch (error) {
        console.error('Gemini AI Error:', error);
        return {
            response: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
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
                price: 0, // Would need room prices
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
 * Determine recommendation category based on item properties
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

    // Extract player count
    const playerMatch = messageLower.match(/(\d+)\s*(?:players?|people|guests?|persons?)/);
    if (playerMatch) {
        updates.preferences_extracted = {
            ...currentContext.preferences_extracted,
        };
    }

    // Detect booking stage
    if (messageLower.includes('book') || messageLower.includes('reserve')) {
        updates.booking_stage = 'selecting';
    } else if (messageLower.includes('confirm') || messageLower.includes('yes')) {
        updates.booking_stage = 'confirming';
    } else if (messageLower.includes('pay')) {
        updates.booking_stage = 'paying';
    }

    return updates;
}

/**
 * Get categorized recommendations
 */
export async function getCategorizedRecommendations(
    type: 'golf' | 'hotel' | 'travel',
    category: 'price' | 'rating' | 'proximity',
    userLocation?: { lat: number; lng: number },
    limit: number = 5
): Promise<Recommendation[]> {
    // This would query Supabase for items sorted by the category
    // For now, return empty array - will be implemented with Supabase queries
    return [];
}

/**
 * Handle vendor swapping in a booking
 */
export async function swapVendor(
    currentBooking: ConversationContext['current_booking'],
    itemType: 'golf' | 'hotel' | 'travel',
    newItemId: string
): Promise<ConversationContext['current_booking']> {
    if (!currentBooking) return undefined;

    const updatedBooking = { ...currentBooking };

    switch (itemType) {
        case 'golf':
            updatedBooking.golf = {
                ...updatedBooking.golf,
                course_id: newItemId,
            } as typeof updatedBooking.golf;
            break;
        case 'hotel':
            updatedBooking.hotel = {
                ...updatedBooking.hotel,
                hotel_id: newItemId,
            } as typeof updatedBooking.hotel;
            break;
        case 'travel':
            updatedBooking.travel = {
                ...updatedBooking.travel,
                package_id: newItemId,
            } as typeof updatedBooking.travel;
            break;
    }

    return updatedBooking;
}
