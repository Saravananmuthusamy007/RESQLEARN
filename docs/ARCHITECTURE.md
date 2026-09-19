# ResqLearn System Architecture & Technical Specifications

## 1. Overview
ResqLearn is an intelligent, closed-loop educational web platform for Basic Life Support (BLS) and First-Aid training. It integrates real-time physical simulation mechanics, deterministic backend scoring, Google Gemini 2.5 Flash adaptive assessments, sequential mastery unlocking, and SHA-256 tamper-evident certification.

```text
LEARN (Clinical Guidelines)
  ↓
UNDERSTAND & PREPARE
  ↓
SIMULATE (Tactile / Real-Time Telemetry Engine)
  ↓
CAPTURE TELEMETRY (Latency, Force, Rhythm, Vectors)
  ↓
DETERMINISTIC PRACTICAL SCORING
  ↓
CHECK PRACTICAL SCORE >= 75%  ──[< 75%]──> RETRY & CLINICAL FEEDBACK
  ↓ [>= 75%]
ADAPTIVE GEMINI 2.5 FLASH ASSESSMENT (Basic / Moderate / Advanced)
  ↓
DETERMINISTIC THEORETICAL SCORING
  ↓
CHECK THEORY SCORE >= 70%     ──[< 70%]──> REMEDIATION RATIONALES
  ↓ [>= 70%]
UPDATE MASTERY RECORD & UNLOCK NEXT LEVEL
  ↓ (When all 5 Levels Completed)
ISSUE SHA-256 CRYPTOGRAPHIC CERTIFICATE
```

---

## 2. Deterministic Practical Scoring Formula

The server calculates the official practical score using the exact formula:

$$\text{Raw Composite Score} = (0.40 \times \text{Action Accuracy}) + (0.35 \times \text{Sequence Score}) + (0.25 \times \text{Time Score}) - (5 \times \text{Mistakes})$$

$$\text{Final Practical Score} = \max(0, \min(100, \text{Raw Composite Score}))$$

* **Action Accuracy ($0.40$ Weight)**: Average physiological technique accuracy (e.g. 100–120 BPM rate, 5.0–6.0 cm depth, 40–60 N force, 15–20°C water temperature).
* **Sequence Score ($0.35$ Weight)**: Monotonic order penalty deduction (-15 pts per out-of-order step).
* **Time Score ($0.25$ Weight)**: Reaction latency and sustained pacing.
* **Mistakes Penalty**: Strict deduction of 5 points per error.
* **Critical Errors**: Any critical safety violation (e.g. ice on burns, windlass over joints) caps the score below passing ($\le 50\%$).
* **Threshold**: Must achieve $\ge 75\%$ to access the adaptive theoretical assessment.

---

## 3. Gemini 2.5 Flash Adaptive Assessment

When a learner qualifies ($\text{score} \ge 75\%$), the backend routes difficulty:
* **$75\% \le \text{Score} \le 80\%$** $\rightarrow$ **BASIC** + Mandatory Fundamental Safety Principles.
* **$80\% < \text{Score} \le 90\%$** $\rightarrow$ **MODERATE**.
* **$\text{Score} > 90\%$** $\rightarrow$ **ADVANCED**.

### Strict JSON Output Schema:
```json
{
  "difficulty": "basic | moderate | advanced",
  "questions": [
    {
      "id": "q1",
      "question": "Clear clinically accurate scenario question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Evidence-based rationale explaining the correct answer.",
      "skill": "Specific BLS Competency"
    }
  ]
}
```

### Deterministic Theoretical Score:
$$\text{MCQ Score} = \left(\frac{\text{Correct Answers}}{\text{Total Questions}}\right) \times 100$$
* **Passing Threshold**: $\ge 70\%$.

### Zero-Downtime Fallback Architecture:
If the Gemini API key is missing or calls timeout, the backend automatically selects from a pre-seeded, 15-question clinical question bank per level (5 basic, 5 moderate, 5 advanced) matching the assigned difficulty cohort.

---

## 4. SHA-256 Tamper-Evident Certification

Certificates are issued strictly on the backend after Level 5 completion:
1. **Canonical Payload Construction**:
   `RESQLEARN-CERT|{learnerId}|{certificateId}|{overallScore}|[{completedLevels}]|{completionDate}|{SALT}`
2. **Hash Computation**:
   Node.js `crypto.createHash('sha256').update(canonicalPayload).digest('hex')`
3. **Verification**:
   The `/verify/:certificateId` endpoint reconstructs the canonical payload from the database record and performs a `crypto.timingSafeEqual` comparison against the stored hash. Any external database tampering invalidates the verification.
