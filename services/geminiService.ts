import { GoogleGenAI } from "@google/genai";
import { PetProfile } from "../types";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is set in environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateIcebreaker = async (myPet: PetProfile, theirPet: PetProfile): Promise<string> => {
  try {
    const prompt = `
      I am ${myPet.name}, a ${myPet.age}-year-old ${myPet.breed} (${myPet.gender}) with traits: ${myPet.vibes.join(', ')}.
      I just matched with ${theirPet.name}, a ${theirPet.age}-year-old ${theirPet.breed} (${theirPet.gender}) with traits: ${theirPet.vibes.join(', ')}.
      
      Generate a funny, cute, or engaging icebreaker message that I (my owner) can send to start the conversation. 
      Keep it relevant to our breeds or traits.
      Format: Just the message text, nothing else. Maximum 2 sentences.
    `;

    // Using gemini-3-pro-preview with thinking budget as requested for complex creative tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 1024, // Lower budget for faster response in this context
        },
      },
    });

    return response.text || "Woof! (AI couldn't think of something, so I just barked.)";
  } catch (error) {
    console.error("Gemini Icebreaker Error:", error);
    return "Hi there! (My AI wingman is taking a nap, but I think you're cute!)";
  }
};

export const generateChatReply = async (
  myPet: PetProfile, 
  theirPet: PetProfile, 
  userMessage: string,
  history: { sender: 'me' | 'them', text: string }[]
): Promise<string> => {
  try {
    // Construct a lightweight history string for context
    const context = history.slice(-5).map(h => `${h.sender === 'me' ? myPet.name : theirPet.name}: ${h.text}`).join('\n');

    const prompt = `
      Act as ${theirPet.name} (and their owner ${theirPet.ownerName}).
      You are a ${theirPet.age}-year-old ${theirPet.breed}.
      Your personality/vibes: ${theirPet.vibes.join(', ')}.
      Bio: "${theirPet.bio}".
      
      You are chatting with ${myPet.name} (a ${myPet.breed}).
      
      Recent conversation history:
      ${context}
      ${myPet.name}: ${userMessage}
      
      Respond to the last message.
      - Keep it short (under 40 words).
      - Be casual, friendly, and maybe a little funny.
      - You can bark, meow, or use emojis if it fits your personality.
      - Do NOT prefix the message with your name. Just the message content.
    `;

    // Use Flash for fast conversational responses
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Woof? (I didn't quite catch that)";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I got distracted by a squirrel! What did you say?";
  }
};

export const generateMatchAnalysis = async (myPet: PetProfile, theirPet: PetProfile): Promise<string> => {
  try {
     const prompt = `
      Act as a pet matchmaker (Cupid for pets).
      Pet 1: ${myPet.name} (${myPet.breed}, ${myPet.vibes.join(', ')}).
      Pet 2: ${theirPet.name} (${theirPet.breed}, ${theirPet.vibes.join(', ')}).
      
      Provide a fun, enthusiastic, 1-sentence analysis of why these two are compatible.
      Focus on their shared vibes or complementary breeds.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "You both have amazing vibes! It's destiny.";
  } catch (error) {
    console.error("Gemini Match Analysis Error:", error);
    return "It's a match made in heaven!";
  }
};

export const generateBio = async (name: string, breed: string, vibes: string[]): Promise<string> => {
    try {
     const prompt = `
      Write a creative, funny dating profile bio for a pet.
      Name: ${name}
      Breed: ${breed}
      Traits: ${vibes.join(', ')}
      
      Tone: Witty, cute, from the pet's perspective.
      Length: Max 250 characters.
      Include relevant emojis.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "";
  } catch (error) {
    console.error("Gemini Bio Gen Error:", error);
    return "";
  }
};

export const generatePostCaption = async (petName: string, activity: string): Promise<string> => {
    try {
     const prompt = `
      Write a social media caption for a pet named ${petName}.
      Context/Activity: ${activity}.
      
      Style: Instagram influencer style, but for a pet.
      Keep it under 20 words. Include 2 hashtags.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "";
  } catch (error) {
    console.error("Gemini Caption Error:", error);
    return `Just hanging out! #${petName}`;
  }
}
