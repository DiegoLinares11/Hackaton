"""
Assessment engine: analyzes extracted text against E4C criteria.
Uses KnowledgeXpert or Claude API to evaluate each field.
"""

import json
import os
import httpx
from criteria import CRITERIA, get_all_fields, get_field_info


KNOWLEDGEXPERT_API_URL = os.getenv("KNOWLEDGEXPERT_API_URL", "")
KNOWLEDGEXPERT_API_KEY = os.getenv("KNOWLEDGEXPERT_API_KEY", "")

# Fallback: use Anthropic API if KnowledgeXpert is not configured
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
USE_ANTHROPIC = bool(ANTHROPIC_API_KEY) and not bool(KNOWLEDGEXPERT_API_KEY)


SYSTEM_PROMPT = """You are an E4C Solutions Library readiness assessment assistant. 
Your job is to evaluate technology documentation against E4C's standardized taxonomy.

CRITICAL RULES:
- You are ADVISORY ONLY. Never say "approved" or "rejected".
- Classify each field as: "complete", "partial", or "missing".
- Every assessment must reference the specific evidence found (or not found) in the document.
- Be specific and actionable in feedback.
- When in doubt, classify as "partial" rather than "complete".

Respond ONLY in valid JSON format, no markdown, no preamble."""


async def evaluate_document(text: str) -> dict:
    """Evaluate a document against all 19 E4C criteria fields."""

    # Build the evaluation prompt
    fields_description = []
    for section_key, section in CRITERIA.items():
        for field_key, field in section["fields"].items():
            fields_description.append(
                f"- {field_key} ({section['label']} > {field['label']}): {field['question']}"
            )

    fields_text = "\n".join(fields_description)

    user_prompt = f"""Analyze the following technology documentation against E4C's Solutions Library framework.

For EACH of the 19 fields below, evaluate the document and return:
- "status": "complete" | "partial" | "missing"
- "evidence": quote or summary of what was found in the document (or "No information found")
- "feedback": specific, actionable suggestion for improvement

Fields to evaluate:
{fields_text}

DOCUMENT TO ANALYZE:
---
{text[:8000]}
---

Respond with a JSON object where keys are the field names listed above. Example:
{{
  "product_description": {{
    "status": "complete",
    "evidence": "The document describes a smart water meter that...",
    "feedback": "Description is thorough. Consider adding the specific mechanism."
  }},
  ...
}}

Respond ONLY with the JSON object. No markdown backticks, no preamble."""

    if USE_ANTHROPIC:
        return await _evaluate_with_anthropic(user_prompt)
    elif KNOWLEDGEXPERT_API_KEY:
        return await _evaluate_with_knowledgexpert(user_prompt)
    else:
        # Demo mode: return mock assessment
        return _generate_demo_assessment(text)


async def _evaluate_with_anthropic(user_prompt: str) -> dict:
    """Use Anthropic Claude API for evaluation."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4096,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": user_prompt}],
            },
        )
        data = response.json()
        text = data["content"][0]["text"]
        # Strip markdown fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)


async def _evaluate_with_knowledgexpert(user_prompt: str) -> dict:
    """Use KnowledgeXpert API for evaluation (uses E4C KnowledgeBases)."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        # Adjust this endpoint/payload to match KnowledgeXpert's actual API
        response = await client.post(
            f"{KNOWLEDGEXPERT_API_URL}/api/chat",
            headers={
                "Authorization": f"Bearer {KNOWLEDGEXPERT_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "message": user_prompt,
                "system": SYSTEM_PROMPT,
                # Add KnowledgeBase IDs here when you have them
                # "knowledgebases": ["e4c-solutions-library"]
            },
        )
        data = response.json()
        # Parse response based on KnowledgeXpert's format
        text = data.get("response", data.get("message", "{}"))
        if isinstance(text, str):
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0]
            return json.loads(text)
        return text


def _generate_demo_assessment(text: str) -> dict:
    """Generate a demo assessment based on simple keyword matching.
    Used when no API key is configured."""
    text_lower = text.lower()

    keyword_map = {
        "product_description": ["product", "system", "device", "solution", "designed to", "works by"],
        "target_sdgs": ["sdg", "sustainable development goal", "ods", "goal 6", "goal 7"],
        "suggested_price": ["$", "usd", "price", "cost", "affordable", "precio"],
        "target_users": ["users", "customers", "households", "communities", "beneficiaries", "usuarios"],
        "competitive_landscape": ["competitor", "alternative", "compared to", "market", "competencia"],
        "countries_regions": ["country", "countries", "region", "africa", "asia", "latin america", "deployed in"],
        "manufacturing_method": ["manufactur", "produced", "fabricat", "assembled", "built"],
        "intellectual_property": ["patent", "open source", "license", "ip", "intellectual property"],
        "user_provision_model": ["distribut", "sold through", "available via", "purchase", "subscription"],
        "distributions_to_date": ["units", "distributed", "deployed", "installed", "sold"],
        "design_specifications": ["specification", "dimensions", "capacity", "material", "weight", "size"],
        "performance_parameters": ["efficiency", "flow rate", "output", "performance", "capacity", "liters"],
        "technical_support": ["maintenance", "training", "support", "service", "repair"],
        "replacement_components": ["replacement", "spare", "component", "parts", "consumable"],
        "lifecycle": ["lifecycle", "lifespan", "durability", "years", "warranty"],
        "safety": ["safety", "hazard", "risk", "safe", "danger", "protection"],
        "academic_references": ["study", "research", "paper", "journal", "reference", "citation"],
        "regulatory_compliance": ["iso", "certification", "standard", "compliance", "regulation", "who"],
        "evaluation_methods": ["tested", "evaluated", "methodology", "protocol", "lab test", "field test"],
    }

    results = {}
    for field_key in get_all_fields():
        info = get_field_info(field_key)
        keywords = keyword_map.get(field_key, [])

        matches = sum(1 for kw in keywords if kw in text_lower)

        if matches >= 3:
            status = "complete"
            evidence = f"Multiple relevant mentions found ({matches} keyword matches)"
            feedback = info.get("feedback_partial", "Looks good. Review for completeness.")
        elif matches >= 1:
            status = "partial"
            evidence = f"Some relevant mentions found ({matches} keyword matches)"
            feedback = info.get("feedback_partial", "Add more detail to this section.")
        else:
            status = "missing"
            evidence = "No information found"
            feedback = info.get("feedback_missing", "This field needs to be added.")

        results[field_key] = {
            "status": status,
            "evidence": evidence,
            "feedback": feedback,
        }

    return results


def build_readiness_report(assessment: dict) -> dict:
    """Build a structured readiness report from the assessment results."""
    sections = {}
    total_complete = 0
    total_partial = 0
    total_missing = 0
    total_score = 0
    max_score = 0

    for section_key, section in CRITERIA.items():
        section_fields = []
        for field_key, field_info in section["fields"].items():
            result = assessment.get(field_key, {
                "status": "missing",
                "evidence": "Not evaluated",
                "feedback": field_info.get("feedback_missing", ""),
            })

            status = result.get("status", "missing")
            weight = field_info.get("weight", 1.0)

            if status == "complete":
                score = 1.0 * weight
                total_complete += 1
            elif status == "partial":
                score = 0.5 * weight
                total_partial += 1
            else:
                score = 0
                total_missing += 1

            total_score += score
            max_score += weight

            section_fields.append({
                "key": field_key,
                "label": field_info["label"],
                "status": status,
                "evidence": result.get("evidence", ""),
                "feedback": result.get("feedback", ""),
                "weight": weight,
                "score": round(score, 2),
            })

        sections[section_key] = {
            "label": section["label"],
            "description": section["description"],
            "fields": section_fields,
            "complete": sum(1 for f in section_fields if f["status"] == "complete"),
            "partial": sum(1 for f in section_fields if f["status"] == "partial"),
            "missing": sum(1 for f in section_fields if f["status"] == "missing"),
        }

    readiness_pct = round((total_score / max_score) * 100) if max_score > 0 else 0

    return {
        "readiness_score": readiness_pct,
        "summary": {
            "total_fields": total_complete + total_partial + total_missing,
            "complete": total_complete,
            "partial": total_partial,
            "missing": total_missing,
        },
        "sections": sections,
        "disclaimer": (
            "This is an advisory assessment only. It does not determine acceptance "
            "or rejection for the E4C Solutions Library. All scores are based on "
            "documentation completeness, not technical validity. Final review is "
            "conducted by E4C expert reviewers."
        ),
    }
