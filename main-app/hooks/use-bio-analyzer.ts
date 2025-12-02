import { useState, useCallback } from 'react';

interface BioAnalysis {
  score: number;
  suggestions: string[];
  strengths: string[];
  missingElements: string[];
  improvedBio: string;
}

interface AnalysisConfig {
  type: 'agent' | 'user';
  minLength: number;
  targetLength: number;
}

const AGENT_KEYWORDS = [
  'experience', 'years', 'real estate', 'property', 'client', 'buy', 'sell',
  'rent', 'lease', 'investment', 'consultation', 'valuation', 'market',
  'professional', 'certified', 'licensed', 'agency', 'service', 'expertise'
];

const USER_KEYWORDS = [
  'looking for', 'prefer', 'interested in', 'budget', 'location', 'family',
  'professional', 'student', 'quiet', 'modern', 'traditional', 'furnished',
  'pet-friendly', 'commute', 'amenities', 'lifestyle', 'needs'
];

export const useBioAnalyzer = (config: AnalysisConfig) => {
  const [analysis, setAnalysis] = useState<BioAnalysis | null>(null);

  const analyzeBio = useCallback((bio: string): BioAnalysis => {
    if (!bio.trim()) {
      return {
        score: 0,
        suggestions: ['Please write a bio to get recommendations'],
        strengths: [],
        missingElements: ['Bio content'],
        improvedBio: ''
      };
    }

    const words = bio.toLowerCase().split(/\s+/);
    const sentences = bio.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate basic metrics
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Keyword analysis
    const keywords = config.type === 'agent' ? AGENT_KEYWORDS : USER_KEYWORDS;
    const foundKeywords = keywords.filter(keyword => 
      bio.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Structure analysis
    const hasExperience = config.type === 'agent' ? 
      /\d+\s*years?/.test(bio) || /experience/.test(bio) : false;
    const hasServices = config.type === 'agent' ?
      /(buy|sell|rent|lease|investment)/i.test(bio) : false;
    const hasPreferences = config.type === 'user' ?
      /(prefer|like|want|need|looking)/i.test(bio) : true;
    
    // Calculate score (0-100)
    let score = 0;
    
    // Length score (30%)
    if (wordCount >= config.targetLength) score += 30;
    else if (wordCount >= config.minLength) score += 20;
    else if (wordCount > 0) score += 10;
    
    // Keyword score (30%)
    const keywordScore = Math.min((foundKeywords.length / keywords.length) * 30, 30);
    score += keywordScore;
    
    // Structure score (20%)
    if (config.type === 'agent') {
      if (hasExperience) score += 10;
      if (hasServices) score += 10;
    } else {
      if (hasPreferences) score += 20;
    }
    
    // Readability score (20%)
    if (sentenceCount >= 2 && avgSentenceLength <= 25) score += 20;
    else if (sentenceCount >= 1) score += 10;
    
    score = Math.min(Math.round(score), 100);
    
    // Generate suggestions
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const missingElements: string[] = [];
    
    // Length suggestions
    if (wordCount < config.minLength) {
      suggestions.push(`Try to write at least ${config.minLength} words for a comprehensive bio`);
      missingElements.push('Adequate length');
    } else if (wordCount < config.targetLength) {
      suggestions.push(`Consider expanding to ${config.targetLength} words for better impact`);
    } else {
      strengths.push('Good length');
    }
    
    // Keyword suggestions
    if (foundKeywords.length < 3) {
      const neededKeywords = keywords.slice(0, 5).join(', ');
      suggestions.push(`Include more relevant keywords like: ${neededKeywords}`);
      missingElements.push('Relevant keywords');
    } else {
      strengths.push('Good use of relevant terms');
    }
    
    // Structure suggestions
    if (config.type === 'agent') {
      if (!hasExperience) {
        suggestions.push('Mention your years of experience in real estate');
        missingElements.push('Experience mention');
      }
      if (!hasServices) {
        suggestions.push('Specify the services you offer (buying, selling, renting, etc.)');
        missingElements.push('Services offered');
      }
    } else {
      if (!hasPreferences) {
        suggestions.push('Describe what you\'re looking for in a property');
        missingElements.push('Property preferences');
      }
    }
    
    // Readability suggestions
    if (sentenceCount < 2) {
      suggestions.push('Break your bio into multiple sentences for better readability');
      missingElements.push('Multiple sentences');
    }
    if (avgSentenceLength > 25) {
      suggestions.push('Try using shorter sentences for better readability');
    } else {
      strengths.push('Good readability');
    }
    
    // Generate improved bio suggestion
    let improvedBio = '';
    if (config.type === 'agent') {
      improvedBio = `With ${hasExperience ? '' : 'X years of '}experience in real estate, I specialize in helping clients with ${hasServices ? '' : 'buying, selling, and renting'} properties. ${bio}`;
    } else {
      improvedBio = `I'm looking for ${hasPreferences ? '' : 'a comfortable property that meets my needs. '}${bio}`;
    }
    
    return {
      score,
      suggestions,
      strengths,
      missingElements,
      improvedBio: improvedBio.length > bio.length ? improvedBio : bio
    };
  }, [config]);

  const updateAnalysis = useCallback((bio: string) => {
    const newAnalysis = analyzeBio(bio);
    setAnalysis(newAnalysis);
    return newAnalysis;
  }, [analyzeBio]);

  return {
    analysis,
    updateAnalysis,
    analyzeBio
  };
};