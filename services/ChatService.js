import ntc from '@functions/ntc'

// Base ChatService interface
class ChatService {
  constructor() {
    if (this.constructor === ChatService) {
      throw new Error("Abstract class 'ChatService' cannot be instantiated directly");
    }
  }

  async processMessage(message, colors) {
    throw new Error("Method 'processMessage' must be implemented");
  }
}

// Non-LLM implementation that provides rule-based color suggestions
export class RuleChatService extends ChatService {
  constructor() {
    super();
  }

  async processMessage(message, colors) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Extract existing colors in hex format
    const hexColors = colors.map(color => color.startsWith('#') ? color : `#${color}`);
    
    // Default response
    let response = "I'm your color assistant. How can I help you with your palette today?";
    let suggestedColors = [];

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

  async processMessage(message, colors) {
    // This is a placeholder for the actual LLM implementation
    // In a real implementation, this would make an API call to the LLM service
    
    console.log('LLM would process:', message);
    console.log('With colors context:', colors);
    
    // For now, just return a mock response
    return {
      message: "I'm an LLM-powered assistant, but I'm not connected to a real LLM yet. Here are some placeholder color suggestions.",
      suggestedColors: [
        { hex: '#FF5733', name: 'Burnt Sienna' },
        { hex: '#33FF57', name: 'Screamin Green' },
        { hex: '#3357FF', name: 'Royal Blue' }
      ]
    };
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