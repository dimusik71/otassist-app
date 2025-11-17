# Multi-Agent AI System Documentation

This document explains the multi-agent AI architecture powering the OT/AH Assessment app.

## Overview

The app uses a sophisticated multi-agent system that intelligently routes tasks to the most appropriate AI model based on the requirements. This ensures optimal performance, cost-efficiency, and accuracy.

## Available AI Agents

### 1. Analysis Agent (GPT-5 Mini)
**Purpose:** Professional text analysis, summaries, and report generation
**Best For:**
- Assessment summaries
- Professional report writing
- Complex text analysis
- Care planning recommendations

**API:** OpenAI GPT-5 Mini
**Location:** `src/lib/aiAgents.ts` - `analysisAgent()`

**Example Usage:**
```typescript
const result = await analysisAgent(
  "Generate a professional assessment summary...",
  ["Context item 1", "Context item 2"]
);
```

### 2. Vision Agent (Gemini 2.5 Flash)
**Purpose:** Image analysis and multimodal understanding
**Best For:**
- Analyzing assessment photos
- Identifying equipment in images
- Environment assessment from photos
- Structured data extraction from images

**API:** Google Gemini 2.5 Flash
**Location:** `src/lib/aiAgents.ts` - `visionAgent()`

**Example Usage:**
```typescript
const result = await visionAgent(
  base64Image,
  "Analyze this home environment and identify accessibility issues"
);
```

### 3. Recommendation Agent (Grok 4 Fast)
**Purpose:** Fast equipment recommendations and quick responses
**Best For:**
- Equipment matching and suggestions
- Quick product recommendations
- Rapid response queries
- Equipment catalog analysis

**API:** xAI Grok 4 Fast
**Location:** `src/lib/aiAgents.ts` - `recommendationAgent()`

**Example Usage:**
```typescript
const result = await recommendationAgent(
  assessmentData,
  equipmentCatalog
);
```

### 4. Structured Analysis Agent (Gemini 2.5 Flash)
**Purpose:** Extract structured JSON data
**Best For:**
- Form field extraction
- Data categorization
- Structured report generation
- Schema-based data extraction

**API:** Google Gemini 2.5 Flash with JSON mode
**Location:** `src/lib/aiAgents.ts` - `structuredAnalysisAgent()`

**Example Usage:**
```typescript
const result = await structuredAnalysisAgent<MyType>(
  "Extract data from this text...",
  { type: "object", properties: { ... } }
);
```

## Multi-Agent Orchestrator

The orchestrator coordinates multiple agents for complex workflows.

**Location:** `src/lib/aiAgents.ts` - `orchestrateAssessmentAnalysis()`

**Workflow:**
1. Analyzes images with Vision Agent (if photos present)
2. Generates summary with Analysis Agent
3. Creates recommendations with Recommendation Agent
4. Returns comprehensive results

**Example Usage:**
```typescript
const results = await orchestrateAssessmentAnalysis({
  clientName: "John Doe",
  assessmentType: "home",
  location: "123 Main St",
  media: [...],
  notes: "Client notes..."
});
```

## Backend AI Routes

### POST /api/assessments/:id/analyze
**Purpose:** Comprehensive assessment analysis
**Agent:** GPT-5 Mini
**Input:** Assessment ID
**Output:** Professional summary, recommendations

### POST /api/ai/equipment-recommendations
**Purpose:** Get equipment suggestions
**Agent:** Grok 4 Fast
**Input:** Assessment ID
**Output:** 3-5 equipment recommendations with justification

### POST /api/ai/vision-analysis
**Purpose:** Analyze images
**Agent:** Gemini 2.5 Flash
**Input:** Base64 image + prompt
**Output:** Image analysis text

## Agent Selection Guide

| Task Type | Recommended Agent | Reason |
|-----------|------------------|--------|
| Professional summaries | GPT-5 Mini | Best for coherent, professional text |
| Image analysis | Gemini 2.5 Flash | Multimodal capabilities |
| Equipment recommendations | Grok 4 Fast | Fast, cost-effective |
| Structured data | Gemini 2.5 Flash | JSON mode support |
| Complex reasoning | GPT-5 Mini | Advanced reasoning |
| Quick responses | Grok 4 Fast | Speed optimized |

## Error Handling

All agents return a standardized response:

```typescript
interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  model: string;
}
```

Always check `success` before using `data`.

## Performance Tips

1. **Use the right agent** - Don't use GPT-5 Mini for simple tasks
2. **Batch requests** - Combine multiple analyses when possible
3. **Cache results** - Store AI responses in database
4. **Handle failures gracefully** - Provide fallback text
5. **Monitor costs** - Track API usage per agent

## Future Enhancements

- Audio transcription with Whisper API
- Real-time vision analysis during photo capture
- Multi-agent debate for complex decisions
- Automated quote generation
- PDF report generation with AI summaries
