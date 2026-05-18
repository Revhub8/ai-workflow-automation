# AI-Powered Workflow Automation System

## Overview
This project is a prototype web application designed to digitize handwritten or semi-structured operational documents into structured, reviewable records with validation and analytics.

It simulates a real-world operational workflow where AI assists in data extraction, followed by human validation and business-rule enforcement before generating insights.

---

## Features

### 1. Document Upload
- Upload images or PDFs
- Preview uploaded files
- Simple and intuitive upload interface

### 2. AI-Based Data Extraction (Prototype)
- Extracts structured fields such as:
  - Date
  - Shift
  - Employee Number
  - Operation Code
  - Machine Number
  - Work Order Number
  - Quantity Produced
  - Time Taken
- Includes confidence scores for each field

> ⚠️ **Note:** Due to API quota limitations, this project uses a **mock AI extraction layer** that simulates intelligent behavior using predefined mappings and dynamic logic.

---

### 3. Review Workflow
- Editable form for extracted data
- Human-in-the-loop correction
- Confidence indicators highlighting uncertain fields

---

### 4. Validation & Error Handling
- Business rules implemented:
  - Required fields validation
  - Shift format (A/B/C)
  - Machine number format (M-XXX)
  - Work order format (WO-XXX)
  - Numeric validation for quantity
- Inline error messages and visual feedback

---

### 5. Data Persistence
- Records are stored in browser `localStorage`
- Enables persistence across page reloads
- Acts as a lightweight alternative to a database for this prototype

---

### 6. Dashboard & Analytics
- Provides operational insights:
  - Total uploads
  - Total and average production quantity
  - Shift-wise summaries
  - Machine-wise summaries
  - Validation insights
- Built using structured and validated data only

---

### 7. Search & History
- View previously processed records
- Search by employee/work order
- Filter by shift and machine
- View detailed record information

---

## AI Approach (Important)

This project is designed as an **AI-assisted workflow system**, not a full AI model implementation.

### Current Implementation
- Uses a **mock AI system** that:
  - Recognizes predefined sample documents
  - Simulates structured extraction
  - Assigns confidence scores
  - Mimics real AI variability

### Why Mock AI?
During development, real AI APIs (such as OpenAI/Gemini) were not used due to:

- API quota limitations (HTTP 429 errors)
- Free-tier restrictions on request usage
- Time constraints for the assignment

### Production-Ready Approach (Future)
The system is designed to easily integrate:

- OCR tools (Tesseract, Google Vision)
- LLM APIs (OpenAI, Gemini)
- Hybrid pipelines (OCR + LLM parsing)

The architecture already supports replacing the mock extraction with real AI services.

---

## Workflow

```txt
1. Upload Document
2. AI Extraction (Mock / Replaceable)
3. Review & Edit
4. Validation Rules Applied
5. Save Record
6. Dashboard Analytics
7. Search & History Access