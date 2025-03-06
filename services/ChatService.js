import ntc from '@functions/ntc'
import adjustTextColor from '@functions/adjustTextColor'

// Base ChatService interface
class ChatService {
  constructor() {
    if (this.constructor === ChatService) {
      throw new Error("Abstract class 'ChatService' cannot be instantiated directly");
    }
  }

  async processMessage(message, colors, chatHistory = []) {
    throw new Error("Method 'processMessage' must be implemented");
  }
}

// Non-LLM implementation that provides rule-based color suggestions
export class RuleChatService extends ChatService {
  constructor() {
    super();
  }

  async processMessage(message, colors, chatHistory = []) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Extract existing colors in hex format
    const hexColors = colors.map(color => color.startsWith('#') ? color : `#${color}`);
    
    // Default response
    let response = "I'm your color assistant. How can I help you with your palette today?";
    let suggestedColors = [];
    
    // Use chat history to provide more contextual responses
    const recentUserMessages = chatHistory
      .filter(msg => msg.isUser)
      .map(msg => msg.message.toLowerCase());
    
    // Check for conversation context
    const isFollowUp = recentUserMessages.length > 1;
    const previousMessages = recentUserMessages.slice(0, -1).join(' ');

    // Check for specific keywords in the message
    if (lowerMessage.includes('complement') || lowerMessage.includes('complementary')) {
      response = "Here are some complementary colors for your palette:";
      suggestedColors = this._generateComplementaryColors(hexColors);
    } 
    else if (lowerMessage.includes('similar') || lowerMessage.includes('like') || lowerMessage.includes('matching')) {
      response = "Here are some colors similar to your current palette:";
      suggestedColors = this._generateSimilarColors(hexColors);
    }
    else if (lowerMessage.includes('random') || lowerMessage.includes('suggest') || lowerMessage.includes('new')) {
      response = "Here are some random color suggestions:";
      suggestedColors = this._generateRandomColors(5);
    }
    else if (lowerMessage.includes('analyze') || lowerMessage.includes('advice') || lowerMessage.includes('improve')) {
      response = this._analyzePalette(hexColors);
    }
    else if (isFollowUp) {
      // Handle follow-up questions based on history
      if (previousMessages.includes('complement') || previousMessages.includes('complementary')) {
        // If previously discussing complementary colors
        if (lowerMessage.includes('more') || lowerMessage.includes('another')) {
          response = "Here are more complementary color options:";
          suggestedColors = this._generateComplementaryColors(hexColors);
        }
      } 
      else if (previousMessages.includes('similar') || previousMessages.includes('like')) {
        // If previously discussing similar colors
        if (lowerMessage.includes('more') || lowerMessage.includes('another')) {
          response = "Here are more similar color options:";
          suggestedColors = this._generateSimilarColors(hexColors);
        }
      }
      else {
        // Generic follow-up
        response = "Based on our conversation, here are some color suggestions:";
        suggestedColors = [
          ...this._generateComplementaryColors(hexColors).slice(0, 2),
          ...this._generateSimilarColors(hexColors).slice(0, 2)
        ];
      }
    }
    else {
      // Generic response with some color suggestions
      response = "I can suggest colors based on your current palette. Here are some options:";
      suggestedColors = [
        ...this._generateComplementaryColors(hexColors).slice(0, 2),
        ...this._generateSimilarColors(hexColors).slice(0, 2),
        ...this._generateRandomColors(1)
      ];
    }

    return {
      message: response,
      suggestedColors
    };
  }

  // Generate complementary colors
  _generateComplementaryColors(hexColors) {
    const suggestedColors = [];
    
    for (const color of hexColors.slice(0, 3)) { // Limit to first 3 colors
      const rgb = this._hexToRgb(color);
      if (!rgb) continue;
      
      // Generate complementary color (opposite on color wheel)
      const complementary = `#${(0xFFFFFF ^ parseInt(color.substring(1), 16)).toString(16).padStart(6, '0')}`;
      const colorName = ntc.name(complementary)[1];
      
      suggestedColors.push({
        hex: complementary,
        name: colorName
      });
    }
    
    return suggestedColors;
  }

  // Generate similar colors
  _generateSimilarColors(hexColors) {
    const suggestedColors = [];
    
    for (const color of hexColors.slice(0, 3)) { // Limit to first 3 colors
      const rgb = this._hexToRgb(color);
      if (!rgb) continue;
      
      // Generate a slightly different color
      const r = Math.max(0, Math.min(255, rgb.r + Math.floor(Math.random() * 60 - 30)));
      const g = Math.max(0, Math.min(255, rgb.g + Math.floor(Math.random() * 60 - 30)));
      const b = Math.max(0, Math.min(255, rgb.b + Math.floor(Math.random() * 60 - 30)));
      
      const similar = this._rgbToHex(r, g, b);
      const colorName = ntc.name(similar)[1];
      
      suggestedColors.push({
        hex: similar,
        name: colorName
      });
    }
    
    return suggestedColors;
  }

  // Generate random colors
  _generateRandomColors(count) {
    const suggestedColors = [];
    
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      const hex = this._rgbToHex(r, g, b);
      const colorName = ntc.name(hex)[1];
      
      suggestedColors.push({
        hex,
        name: colorName
      });
    }
    
    return suggestedColors;
  }

  // Analyze the palette and provide advice
  _analyzePalette(hexColors) {
    if (hexColors.length === 0) {
      return "Your palette is empty. Try adding some colors or using the 'Shuffle' button to get started.";
    }
    
    if (hexColors.length === 1) {
      return "Your palette has only one color. Consider adding more colors to create a more interesting palette.";
    }
    
    if (hexColors.length > 5) {
      return "Your palette has quite a few colors. For most designs, 3-5 colors work best. Consider removing some colors for a more cohesive look.";
    }
    
    // Simple analysis based on color count
    return `Your palette has ${hexColors.length} colors, which is a good number for most designs. If you'd like, I can suggest complementary or similar colors to enhance your palette.`;
  }

  // Helper: Convert hex to RGB
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Helper: Convert RGB to hex
  _rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

// LLM implementation that connects to external service
export class LLMChatService extends ChatService {
  constructor(config = {}) {
    super();
    this.endpoint = config.endpoint || '';
    this.apiKey = config.apiKey || '';
  }

  async processMessage(message, colors, chatHistory = []) {
    // Check if endpoint and API key are configured
    if (!this.endpoint || !this.apiKey) {
      console.error('LLM endpoint or API key not configured');
      return {
        message: "I'm not properly configured to use an external LLM. Please check your API endpoint and key in the settings.",
        suggestedColors: []
      };
    }

    try {
      // Only pass hex codes to the LLM without color names
      const colorContext = colors.join(', ');

      // Format message history for the API request
      const formattedHistory = chatHistory
        .filter(msg => msg.isUser || !msg.suggestedColors) // Only include user messages and non-suggestion responses
        .map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.message
        }));

      // Create the system prompt with context about the current palette
      const systemPrompt = `
You are an expert color consultant with deep knowledge of color theory, design principles, and aesthetic trends.
Current palette hex codes: ${colorContext}

Here is the conversation history ${chatHistory}:

Here is what our user has just said and asked of us: ${message}

KEY CAPABILITIES:
- Provide informed, professional advice on color combinations, harmony, and palette optimization
- Suggest complementary, analogous, triadic, or monochromatic color schemes
- Recommend colors based on psychological effects, cultural associations, and industry best practices
- Help identify optimal color palettes for specific use cases (web design, branding, interior design, etc.)
- Explain color relationships and principles like contrast, saturation, and color psychology

IMPORTANT RESPONSE FORMAT REQUIREMENTS:
1. When suggesting colors, ALWAYS use the format "#RRGGBB" for each color (e.g., #FF5733)
1.1 NEVER include the name of a color in your response, only use the #RRGGBB format
2. Do not include color names, only use the #RRGGBB format
3. All hex codes must be valid 6-character codes prefixed with #
4. You can still provide explanations about color theory and answer questions normally
5. Keep your overall response professional and helpful

Example of correct formatting when suggesting colors:
"I recommend adding these colors to complement your palette:
#FF5733
#33FF57
#5733FF"

Take into account the entire conversation history when responding. Keep answers helpful, professional, and precise.
`;

      // Make the API call to the external LLM with the conversation history
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Default model, can be made configurable
          messages: [
            { role: "system", content: systemPrompt },
            ...formattedHistory
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(data);
      
      // Extract the LLM's response text
      let llmResponse = data.choices?.[0]?.message?.content || 'No response from LLM';
      
      // Parse suggested colors from the response
      // This is a regex to find hex codes
      const hexCodeRegex = /#[A-Fa-f0-9]{6}\b/g;
      
      const suggestedColors = [];
      const hexMatches = [];
      let match;
      
      // Extract all matches from the regex
      while ((match = hexCodeRegex.exec(llmResponse)) !== null) {
        hexMatches.push(match[0]); // Push the captured hex code
      }
      
      // Process each found hex code in the response
      for (const hex of hexMatches) {
        // Get color name from ntc
        const colorInfo = ntc.name(hex);
        const colorName = colorInfo[1];
        
        // Add to suggested colors
        suggestedColors.push({
          hex,
          name: colorName
        });
        
        // Calculate text color that will be visible on this background
        const textColor = adjustTextColor(hex);
        
        // Replace hex in response with styled color name
        const styledColorName = `<span style="color:${textColor}; background-color:${hex}; padding: 2px 6px; border-radius: 3px; display: inline-block;">${colorName}</span>`;
        llmResponse = llmResponse.replace(hex, styledColorName);
      }

      return {
        message: llmResponse,
        suggestedColors
      };
    } catch (error) {
      console.error('Error calling LLM API:', error);
      return {
        message: `I encountered an error while trying to connect to the external LLM: ${error.message}. Please check your API endpoint and key.`,
        suggestedColors: []
      };
    }
  }
}

// Factory function to create the appropriate service
export function createChatService(useLLM = false, config = {}) {
  return useLLM ? new LLMChatService(config) : new RuleChatService();
}

export default {
  createChatService,
  RuleChatService,
  LLMChatService
}; 