Got it. Since this is **NOT a new product** but an **enhancement to your existing Next.js + Supabase system**, I’ll structure this as a **Feature Integration Requirements Document** aligned with your current architecture.

---

# 📄 FEATURE INTEGRATION REQUIREMENTS DOCUMENT

## Project: AI Dashboard + WhatsApp Layer (Enhancement)

---

# 1. 🎯 Objective

Enhance the existing platform by adding:

* Interactive multi-step form (improved UX)
* Automated dashboard generation (Looker Studio)
* Email delivery of dashboards
* AI-powered insights (web chat)
* WhatsApp-based data interaction (premium tier)

⚠️ This must integrate cleanly with the **current system without breaking existing flows**

---

# 2. 🔗 Current System Context

### Existing Stack

* Frontend: Next.js
* Backend: Supabase
* Connectors: Already implemented

### Assumption

* Auth system exists
* Basic UI structure exists
* Deployment pipeline exists

---

# 3. 🧩 Feature Modules (Enhancements Only)

---

## 3.1 Interactive Form (Replace / Enhance Existing Form)

### Goal

Replace current basic form with **high-conversion step-based form**

---

### Functional Requirements

| ID         | Requirement                              |
| ---------- | ---------------------------------------- |
| F-FORM-001 | Replace existing form with step-based UI |
| F-FORM-002 | Show one question per step               |
| F-FORM-003 | Add smooth transitions (fade/slide)      |
| F-FORM-004 | Include 5–7 business questions           |
| F-FORM-005 | Final step collects name + email         |
| F-FORM-006 | Validate each step before moving forward |
| F-FORM-007 | Show progress indicator                  |
| F-FORM-008 | Show loading state on submit             |
| F-FORM-009 | Trigger backend processing on submit     |

---

### Integration Notes

* Should reuse existing layout/components where possible
* Can be:

  * New page `/generate`
  * Or modal overlay on homepage

---

---

## 3.2 Data Handling (Extend Existing Supabase)

### Goal

Store structured input for dashboard + AI usage

---

### Functional Requirements

| ID         | Requirement                                        |
| ---------- | -------------------------------------------------- |
| F-DATA-001 | Extend existing DB schema (do NOT duplicate users) |
| F-DATA-002 | Store form responses linked to user/email          |
| F-DATA-003 | Generate unique session/dashboard ID               |
| F-DATA-004 | Store processed data JSON                          |
| F-DATA-005 | Track dashboard generation status                  |

---

### Required Tables (Extend, not replace)

#### New / Extended Tables

**user_inputs**

* id
* user_id (nullable if guest)
* email
* answers (JSON)
* created_at

**dashboards**

* id
* user_id
* input_id
* looker_url
* status (pending, generated, failed)
* created_at

---

---

## 3.3 Processing Layer (NEW)

### Goal

Convert raw form data into structured dashboard-ready format

---

### Functional Requirements

| ID       | Requirement                             |
| -------- | --------------------------------------- |
| F-AI-001 | Transform input into structured dataset |
| F-AI-002 | Normalize values (e.g. revenue ranges)  |
| F-AI-003 | Generate insights (optional phase 2)    |
| F-AI-004 | Store processed output in DB            |
| F-AI-005 | Trigger dashboard generation            |

---

### Integration Notes

* Can be:

  * Next.js API route
  * Background job (recommended)

---

---

## 3.4 Dashboard Integration (Looker Studio)

### Goal

Generate user-specific dashboards using template

---

### Functional Requirements

| ID        | Requirement                                     |
| --------- | ----------------------------------------------- |
| F-DSH-001 | Use pre-built Looker template                   |
| F-DSH-002 | Connect data source (Google Sheets or BigQuery) |
| F-DSH-003 | Insert user data into data source               |
| F-DSH-004 | Generate unique dashboard link                  |
| F-DSH-005 | Store dashboard URL in Supabase                 |
| F-DSH-006 | Support iframe embedding in app                 |

---

### Integration Constraint

⚠️ Looker does NOT dynamically create dashboards
Solution:

* Use shared template + filtered dataset per user

---

---

## 3.5 Email Delivery (NEW)

### Goal

Send dashboard link after generation

---

### Functional Requirements

| ID          | Requirement                             |
| ----------- | --------------------------------------- |
| F-EMAIL-001 | Trigger email after dashboard is ready  |
| F-EMAIL-002 | Include dashboard link                  |
| F-EMAIL-003 | Handle failures and retries             |
| F-EMAIL-004 | Use existing email service if available |

---

---

## 3.6 Dashboard Viewer (Enhancement)

### Goal

Allow users to view dashboard inside platform

---

### Functional Requirements

| ID         | Requirement                       |
| ---------- | --------------------------------- |
| F-VIEW-001 | Embed Looker dashboard via iframe |
| F-VIEW-002 | Load user-specific dashboard      |
| F-VIEW-003 | Restrict access to owner only     |
| F-VIEW-004 | Add loading state                 |

---

---

## 3.7 AI Chat (Phase 2)

### Goal

Allow users to query their data

---

### Functional Requirements

| ID         | Requirement                   |
| ---------- | ----------------------------- |
| F-CHAT-001 | Add chat UI on dashboard page |
| F-CHAT-002 | Send queries to AI service    |
| F-CHAT-003 | Fetch user-specific data      |
| F-CHAT-004 | Return contextual responses   |
| F-CHAT-005 | Store chat history (optional) |

---

---

## 3.8 WhatsApp Integration (Phase 3 - Premium)

### Goal

Enable users to query data via WhatsApp

---

### Functional Requirements

| ID       | Requirement                      |
| -------- | -------------------------------- |
| F-WA-001 | Integrate WhatsApp API           |
| F-WA-002 | Use n8n for automation workflows |
| F-WA-003 | Map phone number to user         |
| F-WA-004 | Process incoming messages        |
| F-WA-005 | Fetch user data from Supabase    |
| F-WA-006 | Send response via AI             |
| F-WA-007 | Restrict to premium users        |

---

### Integration Flow

* WhatsApp → n8n → Supabase → AI → Response

---

---

## 3.9 Subscription System (Enhancement)

### Goal

Support premium tier

---

### Functional Requirements

| ID        | Requirement                              |
| --------- | ---------------------------------------- |
| F-SUB-001 | Add subscription flag to users           |
| F-SUB-002 | Enable WhatsApp only for premium         |
| F-SUB-003 | Limit free usage (chat, dashboards)      |
| F-SUB-004 | Integrate with existing billing (if any) |

---

---

# 4. 🔄 Updated System Flow

---

### New Flow (Integrated)

1. User opens form
2. Submits responses
3. Data stored in Supabase
4. Processing layer runs
5. Data pushed to dashboard source
6. Looker dashboard generated
7. Email sent
8. User:

   * Views dashboard (iframe)
   * Uses chat
   * Uses WhatsApp (premium)

---

# 5. 🧱 Technical Integration Plan

---

## Frontend (Next.js)

* Add new form component
* Add dashboard viewer page
* Add chat UI

## Backend (Next.js API + Supabase)

* New API routes:

  * `/api/form/submit`
  * `/api/process-data`
  * `/api/generate-dashboard`
  * `/api/chat`

## External Services

* Looker Studio
* n8n
* WhatsApp API
* Email service

---

# 6. ⚠️ Constraints & Considerations

---

### Looker Studio

* No true dynamic creation
* Must use template + data injection

### WhatsApp

* Requires API approval
* Needs number-user mapping

### AI Costs

* Should limit usage per user

---

# 7. 🚀 Phased Rollout Plan

---

## Phase 1 (Immediate)

* New form UI
* Supabase storage
* Email delivery
* Basic dashboard

## Phase 2

* AI chat
* Insights generation

## Phase 3

* WhatsApp integration
* Subscription system

---

# 8. ✅ Acceptance Criteria

---

### Form

* User completes step-based form successfully

### Dashboard

* Unique dashboard generated per user

### Email

* User receives dashboard link

### Viewer

* Dashboard visible inside app

### Chat (Phase 2)

* User can query data and get correct response

### WhatsApp (Phase 3)

* User receives accurate responses via WhatsApp

---

# ✅ Final Summary

This is a **feature layer on top of your current system**, not a rebuild.

You are adding:

* Better UX (form)
* Data intelligence (AI)
* Visualization (Looker)
* Communication layer (chat + WhatsApp)

