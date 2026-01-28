/**
 * Chat API Route
 * 
 * Handles chat interactions with the AI agent.
 * Manages conversation history and context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse } from '@/lib/ai/agent';
import type { ChatMessage, ConversationContext } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        if (!supabase.auth) {
            console.error('CRITICAL: Supabase client initialization failed. Check environment variables.');
            return NextResponse.json(
                { success: false, error: 'Database configuration missing. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.' },
                { status: 500 }
            );
        }

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { message, conversationId } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get or create conversation
        let conversation;
        if (conversationId) {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { success: false, error: 'Conversation not found' },
                    { status: 404 }
                );
            }
            conversation = data;
        } else {
            // Create new conversation
            const { data, error } = await supabase
                .from('conversations')
                .insert({
                    user_id: user.id,
                    messages: [],
                    context: {},
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating conversation:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to create conversation' },
                    { status: 500 }
                );
            }
            conversation = data;
        }

        // Get available data for recommendations
        const [golfCourses, hotels, travelPackages] = await Promise.all([
            supabase
                .from('golf_courses')
                .select('*')
                .eq('is_active', true)
                .limit(20),
            supabase
                .from('hotels')
                .select('*')
                .eq('is_active', true)
                .limit(20),
            supabase
                .from('travel_packages')
                .select('*')
                .eq('is_active', true)
                .limit(20),
        ]);

        // Add user message to history
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };

        const messages: ChatMessage[] = conversation.messages || [];
        messages.push(userMessage);

        // Generate AI response
        const { response, recommendations, updatedContext } = await generateAIResponse(
            message,
            messages.slice(-10), // Keep last 10 messages for context
            conversation.context as ConversationContext,
            {
                golfCourses: golfCourses.data || [],
                hotels: hotels.data || [],
                travelPackages: travelPackages.data || [],
            }
        );

        // Add AI response to history
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
            metadata: {
                recommendations,
            },
        };
        messages.push(assistantMessage);

        // Update conversation in database
        const newContext = {
            ...conversation.context,
            ...updatedContext,
            last_recommendations: recommendations,
        };

        const { error: updateError } = await supabase
            .from('conversations')
            .update({
                messages,
                context: newContext,
                updated_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);

        if (updateError) {
            console.error('Error updating conversation:', updateError);
        }

        // Also update user preferences if extracted
        if (updatedContext?.preferences_extracted) {
            await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...updatedContext.preferences_extracted,
                    updated_at: new Date().toISOString(),
                });
        }

        return NextResponse.json({
            success: true,
            data: {
                conversationId: conversation.id,
                message: assistantMessage,
                recommendations,
            },
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET - Retrieve conversation history
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            // Get specific conversation
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { success: false, error: 'Conversation not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data });
        } else {
            // Get all conversations for user
            const { data, error } = await supabase
                .from('conversations')
                .select('id, created_at, updated_at, context')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(20);

            if (error) {
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch conversations' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, data });
        }
    } catch (error) {
        console.error('Chat GET Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
