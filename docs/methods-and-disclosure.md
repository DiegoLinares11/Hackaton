# E4C Readiness Review — Methods Note & Responsible AI Disclosure

## Track 2: Check My Tech — Readiness Review with AI

---

## 1. Methods Note

### Overview

This tool assists technology innovators in evaluating whether their documentation meets the requirements of E4C's Solutions Library technology assessment framework. It analyzes submitted documentation against 19 standardized fields organized in 4 sections (Snapshot, Manufacturing & Delivery, Performance & Use, Research & Standards).

### Data Flow

1. **Input**: User uploads technology documentation (PDF or text)
2. **Text extraction**: For PDFs, text is extracted using pdfplumber. Plain text is used directly
3. **Criteria mapping**: The extracted text is evaluated against each of the 19 E4C Solutions Library fields using structured prompts sent to the AI model
4. **Classification**: Each field is classified as:
   - **Complete**: Clear, specific information with concrete data found
   - **Partial**: Topic mentioned but insufficient detail or missing quantifiable data
   - **Missing**: No relevant information found for this field
5. **Report generation**: A readiness snapshot is generated with scores, evidence citations, and actionable feedback
6. **Output**: The user receives a visual dashboard showing completeness status per field, with specific suggestions for improvement

### Criteria Source

The 19 assessment fields were derived directly from E4C's Solutions Library Product Reports. We analyzed the standardized taxonomy used in real published entries (including fields such as Product Description, Target SDGs, Market Price, Design Specifications, Performance Parameters, Regulatory Compliance, etc.) to ensure our assessment framework maps accurately to E4C's actual requirements.

### AI Model Usage

- **Primary**: KnowledgeXpert (Bear Creek AI) connected to E4C KnowledgeBases for domain-specific assessment grounded in E4C's curated content
- **Secondary**: Claude Sonnet 4 (Anthropic) for structured document analysis and classification
- The AI model receives the document text and a structured prompt defining each of the 19 fields with evaluation criteria
- The model returns a JSON response with status, evidence, and feedback for each field

### Guardrails

- **Advisory only**: The tool explicitly states it does not determine acceptance or rejection. This disclaimer appears in the UI, the API response, and all generated reports
- **No pass/fail**: There is no threshold that triggers an automated acceptance decision
- **Evidence-based**: Every classification references specific text found (or not found) in the submitted document
- **Transparent scoring**: The readiness percentage reflects documentation completeness only, not technical merit or validity
- **Human-in-the-loop**: The tool is designed to assist innovators in self-assessment; final review is always conducted by E4C expert reviewers

---

## 2. Responsible AI Disclosure

### Data Sources

| Source | Type | Usage |
|--------|------|-------|
| E4C Solutions Library | Curated database (1000+ technologies) | Assessment framework, peer comparison benchmarks |
| E4C Research & Reports | ~100 curated research documents | Domain context and validation |
| E4C News & Insights | Articles and case studies | Additional context |
| User-submitted documentation | User-provided text/PDF | Document being assessed |

### Model Information

| Attribute | Details |
|-----------|---------|
| AI Platform | KnowledgeXpert (Bear Creek AI) + Anthropic Claude |
| Model | Claude Sonnet 4 |
| Usage | Document analysis, criteria classification, feedback generation |
| Temperature | Default (balanced) |
| Max tokens | 4000 per assessment |

### Known Limitations

1. **Text-only analysis**: The tool evaluates text content only. It cannot analyze images, diagrams, schematics, or non-textual evidence that may be present in documentation
2. **Language bias**: Assessment quality may vary for documents written in languages other than English
3. **Keyword sensitivity**: In demo mode (without API), classification relies on keyword matching which can miss nuanced information
4. **No technical validation**: The tool assesses documentation completeness, NOT the technical accuracy or validity of claims made in the documentation
5. **Single-document scope**: The tool evaluates one document at a time; it cannot cross-reference multiple documents from the same technology
6. **Context window limits**: Very long documents (>8000 characters) are truncated, which may cause some sections to not be evaluated
7. **AI hallucination risk**: While we use structured prompts to minimize this, the AI model may occasionally misinterpret document content. All assessments should be reviewed by the user

### Assumptions

- The submitted document is representative of the technology's complete documentation
- Text extraction from PDFs captures the relevant content accurately
- The 19-field taxonomy derived from E4C Product Reports covers the assessment dimensions E4C considers important
- Users understand that "readiness" refers to documentation completeness, not technology maturity

### Ethical Considerations

- **No gatekeeping**: The tool is designed to help innovators improve, not to filter them out
- **Equitable access**: The tool works with simple text input, not requiring specific document formats or paid tools
- **Transparency**: All criteria, scoring logic, and limitations are documented and visible to users
- **No data retention**: Submitted documents are processed in-memory and not stored after the session

### How We Handle Uncertainty

- When the AI is unsure about a classification, it defaults to "partial" rather than "complete" (conservative approach)
- The evidence field always shows exactly what text was found (or states "No information found"), allowing users to verify the assessment
- Users can re-submit improved documentation to see updated results
- The disclaimer is always visible, reminding users this is advisory only

---

*This disclosure accompanies the E4C Readiness Review submission for the 2026 E4C AI Pilot Hackathon.*
