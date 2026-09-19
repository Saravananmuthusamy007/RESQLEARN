# ResqLearn REST API Reference

All requests to `/api/*` except `/api/auth/login`, `/api/auth/register`, `/api/health`, and `/api/certificate/verify/:certificateId` require an `Authorization: Bearer <token>` header.

---

## 1. Authentication
* `POST /api/auth/register`
  - Body: `{ name, email, password, organization, emergencyCertificationNumber }`
  - Returns: `{ success, token, user }`
* `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ success, token, user }`
* `GET /api/auth/me`
  - Returns: `{ success, user }`
* `PUT /api/auth/profile`
  - Body: `{ name, bio, organization, emergencyCertificationNumber }`
  - Returns: `{ success, user }`

---

## 2. Emergency Levels
* `GET /api/levels`
  - Returns all 5 levels with the user's sequential mastery status (`locked`, `unlocked`, `in_progress`, `completed`).
* `GET /api/levels/:id`
  - Returns full level details, clinical guidelines, procedure steps, and targets.
* `PUT /api/levels/:id` (Admin only)
  - Modifies level config, creates a new `LevelVersion` snapshot.

---

## 3. Simulations & Telemetry
* `POST /api/simulations/complete`
  - Body: `{ levelId, levelNumber, actionAccuracy, sequenceScore, timeScore, mistakes, criticalErrors, telemetryEvents, isDemo }`
  - Computes deterministic score using exact formula:
    `Score = (0.40 * Accuracy) + (0.35 * Sequence) + (0.25 * Time) - (5 * Mistakes)`
  - Returns: `{ success, attemptId, scoring, canProceedToAssessment }`
* `GET /api/simulations/history/:levelNumber`
  - Returns recent attempts for the authenticated learner.

---

## 4. Adaptive Assessment
* `POST /api/assessments/generate`
  - Body: `{ levelNumber }`
  - Checks if learner has practical score $\ge 75\%$. Queries Gemini 2.5 Flash for difficulty cohort.
  - Returns: `{ success, assessmentId, difficulty, source, questions }`
* `POST /api/assessments/submit`
  - Body: `{ assessmentId, answers: [{ questionId, selectedAnswer }] }`
  - Calculates score deterministically: `(correct / total) * 100`.
  - Passing threshold: $\ge 70\%$. Unlocks next level via `masteryService`.
  - Returns: `{ success, assessmentScore, isPassed, progression, detailedFeedback }`

---

## 5. Certification
* `GET /api/certificate`
  - Returns verified certificate if all 5 levels completed.
* `GET /api/certificate/verify/:certificateId` (Public)
  - Cryptographically verifies SHA-256 canonical hash against registry.

---

## 6. Feedback & AI Partner
* `POST /api/feedback`
  - Body: `{ rating, category, message }`
* `GET /api/feedback` (Admin only)
  - Lists all submitted feedback entries.
* `POST /api/learning-partner/chat`
  - Body: `{ message, history }`
  - Queries Gemini 2.5 Flash with fallback to clinical knowledge base.

---

## 7. Admin Portal
* `GET /api/admin/analytics`
  - Returns aggregated KPIs, level pass rates, score distribution cohorts, common weak areas, and satisfaction breakdown for Recharts.
* `GET /api/admin/learners?search=&page=&limit=`
  - Paginated list of cadets with completed levels, attempt counts, and certifications.
* `GET /api/admin/learners/:id`
  - Full audit of specific learner's simulation attempts and telemetry.
