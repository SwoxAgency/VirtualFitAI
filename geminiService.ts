import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini API Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_API_KEY});

export const generateTryOnImage = async (
  userImageBase64: string,
  garmentImageBase64: string,
  garmentDescription: string,
  category: string = 'top' // Default category
): Promise<string> => {
  try {
    // We strip the data URL prefix to get raw base64 for the API
    const cleanUserImage = userImageBase64.split(',')[1];
    const cleanGarmentImage = garmentImageBase64.split(',')[1];

    const prompt = `
      ACT AS: World-class Fashion Photographer and CGI Specialist.
      TASK: High-Fidelity Virtual Try-On (VTO).
      
      INPUTS:
      1. MODEL_IMAGE: Photo of a person (User).
      2. GARMENT_IMAGE: Photo of a clothing item.
      
      GOAL: Generate a hyper-realistic image of the person in MODEL_IMAGE wearing the item from GARMENT_IMAGE.
      
      STRICT COMPOSITION RULES:
      1. **ANATOMICAL MAPPING**: The garment must wrap naturally around the user's specific body shape, muscle definition, and pose. It must NOT look flat or like a sticker. Respect the user's chest, shoulders, and waist curvature.
      2. **REPLACEMENT**: Completely replace the user's existing ${category} with the new garment. 
      3. **PRESERVATION**: 
         - DO NOT CHANGE the user's face, head, hair, skin tone, hands, or legs.
         - DO NOT CHANGE the background or lighting environment.
         - PRESERVE the original image quality and noise grain.
      4. **PHYSICS & DRAPE**: Add realistic folds, creases, and shadows where the fabric would naturally bunch up (e.g., elbows, waist). Gravity must affect the garment.
      5. **LIGHTING INTEGRATION**: Apply the exact lighting direction, color, and intensity from the MODEL_IMAGE onto the new garment. Cast shadows from the user's chin/arms onto the new garment.

      GARMENT DETAILS:
      - Description: ${garmentDescription}
      - Category: ${category}
      
      OUTPUT: Return ONLY the generated image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanUserImage,
            },
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanGarmentImage,
            },
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0) {
        // Look for the inline data part
        const imagePart = parts.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
    }
    
    throw new Error("No image generated");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
