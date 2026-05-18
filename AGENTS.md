# AGENTS.md — AI Workflow & Engineering Approach

## 1. Introduction

This project implements an **AI-assisted workflow automation system** designed to digitize handwritten or semi-structured operational documents into structured, validated, and analyzable records.

Rather than focusing purely on AI model implementation, the system is built as a **practical, production-inspired workflow**, combining:

- AI-assisted extraction (simulated)
- Human-in-the-loop validation
- Business rule enforcement
- Data-driven analytics

The system is structured using an **agent-based design approach**, where each stage of the workflow is treated as a logical "agent" responsible for a specific task.

---

## 2. High-Level Workflow

```txt
[ Upload Agent ]
        ↓
[ Extraction Agent (Mock AI) ]
        ↓
[ Normalization Layer ]
        ↓
[ Confidence Scoring Agent ]
        ↓
[ Review Agent (User) ]
        ↓
[ Validation Agent ]
        ↓
[ Persistence Layer ]
        ↓
[ Analytics Agent ]
        ↓
[ Search & History Agent ]
## 3. Agent Design & Responsibilities

### 3.1 Upload Agent

#### Purpose
Handles document ingestion into the system.

#### Responsibilities

- Accept image/PDF uploads
- Provide preview functionality
- Maintain upload interaction state

#### Implementation

- Built using React components
- Drag-and-drop support via `react-dropzone`
- Temporary file handling in client state

---

### 3.2 Extraction Agent (Mock AI Layer)

#### Purpose
Simulates AI-based extraction of structured data from documents.

#### Responsibilities

- Interpret uploaded document
- Return structured JSON output
- Assign confidence scores to each field

#### Implementation Details

Implemented in `/api/extract`

Uses:

- filename-based matching
- conditional logic (simulated intelligence)

Returns predefined structured data mapped to sample documents.

#### Example Output

```json
{
  "date": "2024-05-10",
  "shift": "A",
  "employeeNumber": "EMP101",
  "machineNumber": "M-101",
  "quantityProduced": 500,
  "confidence": {
    "shift": 0.92,
    "machineNumber": 0.88
  }
}
```

---

### 3.3 Why Mock AI Instead of Real AI

During development, real AI APIs were evaluated but not used due to:

- API quota limitations (HTTP 429 errors)
- Free-tier request restrictions
- Time constraints (1-day implementation window)

#### Design Decision

A mock AI system was implemented to:

- Simulate realistic extraction behavior
- Enable full workflow demonstration
- Allow easy replacement with real AI in future

---

### 3.4 Future Real AI Integration Plan

The system is designed to integrate real AI using:

```txt
Image → OCR → Raw Text → LLM → Structured JSON
```

#### Possible Tools

- Tesseract (OCR)
- Google Vision API
- OpenAI / Gemini (LLM parsing)

The current architecture ensures minimal changes are required to replace the mock layer.

---

### 3.5 Normalization Layer

#### Purpose
Standardize extracted data into a consistent internal schema.

#### Responsibilities

Convert raw or semi-structured output into:

- fixed field names
- consistent formats

Ensure compatibility with validation and analytics layers.

#### Examples

```txt
"Shift A" → "A"
"Machine 101" → "M-101"
"500 units" → 500
```

---

### 3.6 Confidence Scoring Agent

#### Purpose
Indicate reliability of extracted data.

#### Responsibilities

- Assign confidence scores (0–1 range)
- Highlight uncertain fields in UI

#### UI Behavior

Low confidence (`< 0.8`):

- highlighted fields
- visual warnings

---

### 3.7 Review Agent (Human-in-the-loop)

#### Purpose
Enable human correction of AI-extracted data.

#### Responsibilities

- Provide editable interface
- Allow users to modify fields
- Improve final data accuracy

#### Implementation

- Controlled React form
- Real-time state updates

#### Design Insight

Recognizes that:

```txt
AI is not perfect → human validation is essential
```

---

### 3.8 Validation Agent

#### Purpose
Ensure data integrity using business rules.

#### Validation Rules

##### Required Fields

- date
- shift
- employeeNumber

##### Format Constraints

- `shift ∈ {A, B, C}`
- `machineNumber` starts with `"M-"`
- `workOrderNumber` starts with `"WO-"`

##### Numeric Constraints

- `quantityProduced` must be a number

#### Behavior

- Inline error messages
- Prevent saving invalid data

---

### 3.9 Persistence Layer

#### Purpose
Store processed records.

#### Implementation

- Uses browser `localStorage`
- Stores only validated records

#### Reasoning

- Lightweight solution for prototype
- Avoids backend complexity
- Enables persistence across sessions

---

### 3.10 Analytics Agent

#### Purpose
Generate operational insights from processed data.

#### Metrics Generated

- Total uploads
- Total quantity produced
- Average production
- Shift-wise distribution
- Machine-wise aggregation
- Validation insights

#### Key Design Principle

Only validated and reviewed data is used for analytics.

---

### 3.11 Search & History Agent

#### Purpose
Enable retrieval and exploration of past records.

#### Features

##### View All Processed Records

- Access historical processed entries

##### Search

- employee number
- work order

##### Filter

- shift
- machine

##### Additional Capability

- View detailed record information

---

## 4. AI-Assisted Development Workflow

### Tool Used

Cursor (AI-powered code editor)

---

### How AI Was Used

Generated:

- UI components (upload, review, dashboard)
- API routes
- validation logic

Assisted with:

- debugging
- refactoring
- structuring components

---

### Prompting Strategy

Development followed an iterative AI workflow:

```txt
Define requirement → Prompt Cursor → Generate code
        ↓
Test functionality → Identify issues
        ↓
Refine prompt → Regenerate/improve
```

---

### Where AI Helped Most

- Rapid UI generation
- Boilerplate reduction
- Structuring React components
- Accelerating development speed

---

### Where Manual Work Was Required

- System design decisions
- Data schema definition
- Validation logic design
- Workflow integration
- Debugging edge cases

---

## 5. Trade-offs & Constraints

### Constraints

- Limited time (1-day build)
- API quota limitations
- No backend infrastructure

---

### Trade-offs

- Mock AI instead of real AI
- `localStorage` instead of database
- Simulated document recognition

---

## 6. System Design Philosophy

This project prioritizes:

- End-to-end workflow completion
- Practical usability
- Real-world system thinking
- AI-assisted architecture (not just AI usage)

---

## 7. Future Enhancements

- Real AI integration (OCR + LLM)
- Backend database (MongoDB/PostgreSQL)
- File storage (S3/Cloudinary)
- Authentication system
- Advanced analytics & visualizations
- Multi-user workflows

---

## 8. Conclusion

This project demonstrates a production-inspired AI workflow system that:

- Simulates intelligent document processing
- Incorporates human validation
- Enforces business rules
- Generates actionable insights

It reflects how AI systems are actually deployed in real-world operational environments — not as standalone models, but as part of a structured, reliable workflow pipeline.