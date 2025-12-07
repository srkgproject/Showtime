import { GoogleGenAI } from "@google/genai";
import { Movie } from "../types";

const getClient = () => {
  // Assuming process.env.API_KEY is available in the environment
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getAIRecommendations = async (
  userHistoryMovies: Movie[],
  availableMovies: Movie[]
): Promise<string> => {
  try {
    const ai = getClient();
    
    const historyTitles = userHistoryMovies.map(m => m.title).join(", ");
    const availableTitles = availableMovies.map(m => m.title).join(", ");

    const prompt = `
      The user has watched the following movies: ${historyTitles}.
      Based on this history, recommend 3 movies from the following available list: ${availableTitles}.
      Return the response as a JSON array of strings containing only the exact titles of the recommended movies.
      Do not include any markdown formatting or explanation. Just the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "[]";
  }
};

export const getChatbotResponse = async (message: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a helpful customer support agent for SHOWTIME, a movie streaming and booking app. 
            Answer the user's query politely and briefly. User query: ${message}`
        });
        return response.text;
    } catch (error) {
        console.error("Chatbot Error", error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
}
