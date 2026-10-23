import { Complaint } from '../types';

// Common stop words to filter out during text tokenization
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'regarding', 'please', 'complaint', 'grievance', 'matter', 'dated', 'sir', 'madam', 'kindly'
]);

// Tokenize text into lower-case clean alphanumeric words
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

// Compute Jaccard coefficient between two token arrays
export function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Find overlapping key terms between two texts
export function findOverlappingTerms(textA: string, textB: string): string[] {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));
  const overlap: string[] = [];
  
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      overlap.push(token);
    }
  }
  return overlap.slice(0, 5); // top 5 key terms
}

// Levenshtein distance for fuzzy string comparison
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function stringSimilarity(strA: string, strB: string): number {
  const sA = strA.toLowerCase().trim();
  const sB = strB.toLowerCase().trim();
  if (sA === sB) return 1.0;
  const maxLen = Math.max(sA.length, sB.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(sA, sB);
  return Math.max(0, 1 - dist / maxLen);
}

export interface MatchAnalysis {
  overallScore: number; // 0 to 100
  institutionMatchScore: number;
  categoryMatchScore: number;
  textSimilarityScore: number;
  dateProximityScore: number;
  matchSignals: string[];
  explanation: string;
  isPotentialDuplicate: boolean;
}

/**
 * Explainable Related-Case Scoring Engine (Heuristic Weighting)
 * Max weights:
 * - Institution Match: 40 points
 * - Category Match: 25 points
 * - Text & Title Semantic Overlap: 30 points
 * - Date Proximity: 5 points
 * Total potential: 100 points
 */
export function calculateRelatedness(
  caseA: {
    institutionId?: string;
    institutionCode?: string;
    institutionName: string;
    category: string;
    title: string;
    description: string;
    submissionDate?: string;
  },
  caseB: {
    institutionId?: string;
    institutionCode?: string;
    institutionName: string;
    category: string;
    title: string;
    description: string;
    submissionDate?: string;
  }
): MatchAnalysis {
  const matchSignals: string[] = [];
  let institutionScore = 0;
  let categoryScore = 0;
  let textScore = 0;
  let dateScore = 0;

  // 1. Institution Match (Max 40)
  const exactCodeMatch =
    caseA.institutionCode &&
    caseB.institutionCode &&
    caseA.institutionCode.trim().toLowerCase() === caseB.institutionCode.trim().toLowerCase();

  const exactIdMatch =
    caseA.institutionId &&
    caseB.institutionId &&
    caseA.institutionId === caseB.institutionId;

  if (exactCodeMatch || exactIdMatch) {
    institutionScore = 40;
    matchSignals.push(`Exact Institution Match (${caseA.institutionCode || 'Same ID'}) [+40 pts]`);
  } else {
    // Fuzzy name matching
    const nameSim = stringSimilarity(caseA.institutionName, caseB.institutionName);
    const tokensInstA = tokenize(caseA.institutionName);
    const tokensInstB = tokenize(caseB.institutionName);
    const jaccardInst = jaccardSimilarity(tokensInstA, tokensInstB);
    const bestInstSim = Math.max(nameSim, jaccardInst);

    if (bestInstSim > 0.8) {
      institutionScore = 35;
      matchSignals.push(`Very High Institution Name Similarity (${Math.round(bestInstSim * 100)}%) [+35 pts]`);
    } else if (bestInstSim > 0.5) {
      institutionScore = Math.round(bestInstSim * 30);
      matchSignals.push(`Partial Institution Name Similarity (${Math.round(bestInstSim * 100)}%) [+${institutionScore} pts]`);
    } else {
      institutionScore = 0;
    }
  }

  // 2. Category Match (Max 25)
  if (caseA.category === caseB.category) {
    categoryScore = 25;
    matchSignals.push(`Identical Complaint Category: "${caseA.category}" [+25 pts]`);
  } else {
    // Check if categories share broad themes (e.g. fees vs administration)
    categoryScore = 0;
  }

  // 3. Text & Title Overlap (Max 30)
  const fullTextA = `${caseA.title} ${caseA.description}`;
  const fullTextB = `${caseB.title} ${caseB.description}`;
  const tokensA = tokenize(fullTextA);
  const tokensB = tokenize(fullTextB);
  
  const jaccardText = jaccardSimilarity(tokensA, tokensB);
  const overlappingTerms = findOverlappingTerms(fullTextA, fullTextB);

  // Scaled up to 30 points
  const rawTextPoints = Math.min(30, Math.round(jaccardText * 100 * 1.5));
  textScore = rawTextPoints;

  if (overlappingTerms.length > 0) {
    matchSignals.push(
      `Shared Key Terms: [${overlappingTerms.join(', ')}] (Overlap Index: ${Math.round(jaccardText * 100)}%) [+${textScore} pts]`
    );
  }

  // 4. Date Proximity (Max 5 pts bonus)
  if (caseA.submissionDate && caseB.submissionDate) {
    const d1 = new Date(caseA.submissionDate).getTime();
    const d2 = new Date(caseB.submissionDate).getTime();
    const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

    if (diffDays <= 30) {
      dateScore = 5;
      matchSignals.push(`Close Filing Window: Within ${Math.round(diffDays)} days [+5 pts]`);
    } else if (diffDays <= 60) {
      dateScore = 3;
      matchSignals.push(`Filing Window: Within ${Math.round(diffDays)} days [+3 pts]`);
    }
  }

  const overallScore = Math.min(100, institutionScore + categoryScore + textScore + dateScore);

  // Build human-friendly explanation
  let explanation = '';
  if (overallScore >= 70) {
    explanation = `High correlation detected. Cases share ${
      institutionScore >= 35 ? 'the same institution' : 'similar institutions'
    } with overlapping subject matter regarding ${caseA.category.toLowerCase()}. Recommend officer review for potential consolidation or cross-referencing.`;
  } else if (overallScore >= 45) {
    explanation = `Moderate similarity detected. Common characteristics found in ${
      matchSignals.length > 0 ? matchSignals.join(', ') : 'institution or complaint topic'
    }. Discretionary review recommended.`;
  } else {
    explanation = `Low similarity. Complaints appear distinct across institution identifiers, subject categories, and key terminology.`;
  }

  const isPotentialDuplicate = overallScore >= 65;

  return {
    overallScore,
    institutionMatchScore: institutionScore,
    categoryMatchScore: categoryScore,
    textSimilarityScore: textScore,
    dateProximityScore: dateScore,
    matchSignals,
    explanation,
    isPotentialDuplicate
  };
}

/**
 * Helper to scan existing complaints for potential duplicates against a new complaint draft
 */
export function findSimilarExistingComplaints(
  newDraft: {
    institutionId?: string;
    institutionCode?: string;
    institutionName: string;
    category: string;
    title: string;
    description: string;
  },
  existingComplaints: Complaint[],
  threshold: number = 60
): Array<{ complaint: Complaint; analysis: MatchAnalysis }> {
  const matches: Array<{ complaint: Complaint; analysis: MatchAnalysis }> = [];

  for (const c of existingComplaints) {
    const analysis = calculateRelatedness(newDraft, c);
    if (analysis.overallScore >= threshold) {
      matches.push({ complaint: c, analysis });
    }
  }

  return matches.sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);
}
