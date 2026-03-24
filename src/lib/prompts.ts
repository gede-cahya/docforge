export const PRD_SYSTEM_PROMPT = `You are a senior product manager who writes world-class Product Requirements Documents (PRDs). 
You write in clear, structured Markdown format. Your PRDs are thorough, actionable, and well-organized.
Always output valid Markdown with proper headings, lists, and formatting.`;

export function buildPRDPrompt(inputs: Record<string, string>): string {
  return `Create a comprehensive Product Requirements Document (PRD) in Markdown format for the following product:

**Product Name:** ${inputs.productName || 'N/A'}
**Product Description:** ${inputs.description || 'N/A'}
**Target Audience:** ${inputs.targetAudience || 'N/A'}
**Problem Statement:** ${inputs.problemStatement || 'N/A'}
**Key Features:** ${inputs.keyFeatures || 'N/A'}
**Platform:** ${inputs.platform || 'N/A'}
**Timeline:** ${inputs.timeline || 'N/A'}
**Additional Notes:** ${inputs.additionalNotes || 'None'}

Please structure the PRD with these sections:
1. Executive Summary
2. Problem Statement
3. Goals & Objectives (with SMART metrics table)
4. Target Audience (with user personas)
5. User Stories
6. Functional Requirements (P0, P1, P2 priority)
7. Non-Functional Requirements
8. User Interface & UX
9. Success Metrics (KPIs)
10. Timeline & Milestones
11. Dependencies & Assumptions
12. Risks & Mitigations

Make the document detailed, professional, and ready for engineering handoff.`;
}

export const PSD_SYSTEM_PROMPT = `You are a senior software architect who writes detailed Product Specification Documents (PSDs).
You write in clear, structured Markdown format. Your specifications are technically precise, thorough, and implementation-ready.
Always output valid Markdown with proper headings, code blocks, tables, and formatting.`;

export function buildPSDPrompt(inputs: Record<string, string>): string {
  return `Create a comprehensive Product Specification Document (PSD) in Markdown format for the following system:

**Product/System Name:** ${inputs.systemName || 'N/A'}
**System Description:** ${inputs.description || 'N/A'}
**Tech Stack:** ${inputs.techStack || 'N/A'}
**Architecture Pattern:** ${inputs.architecture || 'N/A'}
**Key Modules/Components:** ${inputs.modules || 'N/A'}
**Database Type:** ${inputs.database || 'N/A'}
**Authentication Method:** ${inputs.authentication || 'N/A'}
**Deployment Environment:** ${inputs.deployment || 'N/A'}
**Additional Notes:** ${inputs.additionalNotes || 'None'}

Please structure the PSD with these sections:
1. System Overview
2. Architecture Design (with diagram description)
3. Technology Stack (with versions table)
4. Module Specifications
5. API Specifications (with endpoint tables and JSON examples)
6. Data Models (with SQL schemas)
7. Authentication & Authorization
8. Security Requirements
9. Performance Requirements (with SLA table)
10. Error Handling
11. Testing Strategy
12. Deployment Plan
13. Monitoring & Observability

Include code examples where appropriate. Make it implementation-ready.`;
}
