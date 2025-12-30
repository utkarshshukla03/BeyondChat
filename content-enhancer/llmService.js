import axios from 'axios';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Service
 * Handles content enhancement using various LLM providers
 */
export class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.setupClient();
  }

  setupClient() {
    if (this.provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY || 'mock-key-for-testing';
      this.client = new OpenAI({
        apiKey: apiKey
      });
      this.model = process.env.LLM_MODEL_OPENAI || 'gpt-4-turbo-preview';
      
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  No OPENAI_API_KEY provided. Using mock responses.');
        this.useMockMode = true;
      }
    } else if (this.provider === 'ollama') {
      this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      this.model = process.env.LLM_MODEL_OLLAMA || 'mistral';
      console.log(`🦙 Using Ollama: ${this.ollamaUrl} with model: ${this.model}`);
    } else if (this.provider === 'gemini') {
      this.geminiApiKey = process.env.GEMINI_API_KEY;
      this.model = process.env.LLM_MODEL_GEMINI || 'gemini-pro';
      this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
      
      if (!this.geminiApiKey) {
        console.warn('⚠️  No GEMINI_API_KEY provided. Using mock responses.');
        this.useMockMode = true;
      } else {
        console.log(`🔮 Using Google Gemini: ${this.model}`);
      }
    }
    // Additional providers can be added here
  }

  /**
   * Enhance article content using LLM
   */
  async enhanceArticle(originalArticle, referenceArticles) {
    try {
      console.log(`🤖 Enhancing article: "${originalArticle.title}"`);

      const prompt = this.buildEnhancementPrompt(originalArticle, referenceArticles);
      
      if (this.provider === 'openai') {
        return await this.enhanceWithOpenAI(prompt);
      } else if (this.provider === 'ollama') {
        return await this.enhanceWithOllama(prompt);
      } else if (this.provider === 'gemini') {
        return await this.enhanceWithGemini(prompt);
      } else if (this.provider === 'claude') {
        return await this.enhanceWithClaude(prompt);
      }
    } catch (error) {
      console.error('❌ LLM enhancement error:', error.message);
      throw error;
    }
  }

  /**
   * Build enhancement prompt
   */
  buildEnhancementPrompt(originalArticle, referenceArticles) {
    const refText = referenceArticles
      .map(ref => `Title: ${ref.title}\nContent: ${ref.paragraphs.slice(0, 3).join('\n')}\n`)
      .join('\n---\n');

    return `You are a professional content editor and SEO expert. Your task is to enhance and improve the following article while maintaining its original intent and avoiding plagiarism.

ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

REFERENCE ARTICLES (for structure and depth insights):
${refText}

INSTRUCTIONS:
1. Rewrite the article to be more comprehensive and well-structured
2. Improve clarity and readability
3. Add relevant sections and subsections using proper headings
4. Incorporate insights from reference articles WITHOUT plagiarizing
5. Use bullet points and lists where appropriate
6. Maintain the original tone and author's intent
7. Improve SEO while keeping content natural
8. Output in clean HTML format with proper semantic tags
9. Do NOT copy content directly from references

OUTPUT FORMAT:
Provide the enhanced article in HTML format with:
- Proper heading hierarchy (h1, h2, h3)
- Well-structured paragraphs
- Lists where appropriate
- A strong introduction
- Clear conclusion
- Professional formatting

IMPORTANT: The output should be valid HTML suitable for web publication.`;
  }

  /**
   * Enhance using OpenAI
   */
  async enhanceWithOpenAI(prompt) {
    try {
      // Use mock mode if no real API key
      if (this.useMockMode) {
        console.log('📋 Using mock enhancement (no real API key provided)');
        return this.getMockEnhancedContent();
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content editor who enhances articles for quality, depth, and SEO while maintaining originality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const enhancedContent = response.choices[0].message.content;
      console.log('✅ Content enhanced with OpenAI');
      return enhancedContent;
    } catch (error) {
      console.error('❌ OpenAI error:', error.message);
      console.log('📋 Falling back to mock enhancement');
      return this.getMockEnhancedContent();
    }
  }

  /**
   * Enhance using Gemini (real implementation)
   */
  async enhanceWithGemini(prompt) {
    try {
      if (this.useMockMode) {
        console.log('📋 Using mock enhancement (no API key provided)');
        return this.getMockEnhancedContent();
      }

      console.log(`📡 Sending to Google Gemini (${this.model})...`);
      
      // Use correct Gemini API endpoint - generativeai.googleapis.com instead of generativelanguage
      const response = await axios.post(
        `https://generativeai.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_UNSPECIFIED',
              threshold: 'BLOCK_NONE'
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.geminiApiKey
          },
          timeout: 60000
        }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        const enhancedContent = response.data.candidates[0].content.parts[0].text;
        console.log('✅ Content enhanced with Google Gemini');
        return enhancedContent;
      } else {
        console.error('❌ Unexpected Gemini response format');
        return this.getMockEnhancedContent();
      }
    } catch (error) {
      console.error('❌ Gemini error:', error.message);
      if (error.response?.data?.error?.message) {
        console.error('   Details:', error.response.data.error.message);
      }
      console.log('📋 Falling back to mock enhancement');
      return this.getMockEnhancedContent();
    }
  }

  /**
   * Enhance using Ollama (local LLM)
   */
  async enhanceWithOllama(prompt) {
    try {
      console.log(`📡 Sending to Ollama (${this.model})...`);
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        temperature: 0.7
      }, {
        timeout: 120000 // 2 minute timeout for local processing
      });

      const enhancedContent = response.data.response;
      console.log('✅ Content enhanced with Ollama');
      return enhancedContent;
    } catch (error) {
      console.error('❌ Ollama error:', error.message);
      console.log('💡 Make sure Ollama is running: ollama serve');
      throw error;
    }
  }

  /**
   * Enhance using Claude (mock implementation)
   */
  async enhanceWithClaude(prompt) {
    try {
      // Implement Anthropic Claude integration
      console.log('🔧 Claude integration not yet fully implemented, using mock enhancement');
      return this.getMockEnhancedContent();
    } catch (error) {
      console.error('❌ Claude error:', error.message);
      throw error;
    }
  }

  /**
   * Mock enhanced content for testing
   */
  getMockEnhancedContent() {
    return `
<div class="enhanced-article">
  <h2>Introduction</h2>
  <p>This is an enhanced version of the original article, enriched with additional insights and better structure for improved readability and SEO performance.</p>
  
  <h2>Key Concepts</h2>
  <ul>
    <li>Enhanced structure and organization</li>
    <li>Improved readability</li>
    <li>Better SEO optimization</li>
    <li>Comprehensive coverage</li>
  </ul>
  
  <h2>Conclusion</h2>
  <p>The enhanced article provides deeper insights and better structure while maintaining the original intent and message.</p>
</div>
    `;
  }

  /**
   * Generate references section
   */
  generateReferencesSection(referenceArticles) {
    let html = '<h2>References</h2>\n<ul>\n';
    
    referenceArticles.forEach((ref, index) => {
      html += `  <li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title}</a></li>\n`;
    });
    
    html += '</ul>';
    return html;
  }

  /**
   * Format content with references
   */
  formatFinalContent(enhancedContent, referenceArticles) {
    const referencesSection = this.generateReferencesSection(referenceArticles);
    return enhancedContent + '\n\n' + referencesSection;
  }
}

export default new LLMService();
