"""
app/utils/disease_mapper.py
────────────────────────────────────────────────────────────────────────────────
Deterministic, single-source-of-truth conversion between:
  • raw ML class names  (e.g. "Cowpea___Bacterial_Wilt", "soyabean rust")
  • JSON keys           (e.g. "cowpea_bacterial_wilt")
  • UI display strings  (e.g. "Cowpea Bacterial Wilt")

RULES (applied in order inside to_key):
  1. Strip leading/trailing whitespace.
  2. Lowercase everything.
  3. Replace ALL separator variants with a single underscore:
       "___"  →  "_"      (PlantVillage-style triple underscores)
       " - "  →  "_"      (human-readable dash)
       " – "  →  "_"      (en-dash)
       "-"    →  "_"      (plain hyphen)
       " "    →  "_"      (spaces)
  4. Collapse any run of underscores (__, ___, …) to exactly one "_".
  5. Strip any leading or trailing underscores that survive step 4.

These same five rules are what was used when the pesticide_rules.json keys
were authored, so to_key(any_ml_class_name) == matching JSON key is guaranteed
for every disease present in the JSON.
────────────────────────────────────────────────────────────────────────────────
"""

import re


# ── Public API ────────────────────────────────────────────────────────────────

def to_key(text: str) -> str:
    """
    Convert any ML class name → canonical snake_case JSON key.

    Examples
    --------
    to_key("Cowpea___Bacterial_Wilt")   → "cowpea_bacterial_wilt"
    to_key("Cowpea Bacterial Wilt")     → "cowpea_bacterial_wilt"
    to_key("soyabean - Yellow Mosaic")  → "soyabean_yellow_mosaic"
    to_key("Pea___Powder_Mildew_Leaf")  → "pea_powder_mildew_leaf"
    to_key("  bean rust  ")             → "bean_rust"
    """
    if not text:
        return ""

    s = text.strip().lower()

    # Step 3 – replace all separator variants with "_"
    s = s.replace("___", "_")   # triple underscore first (PlantVillage)
    s = s.replace(" – ", "_")   # en-dash with spaces
    s = s.replace(" - ", "_")   # hyphen with spaces
    s = s.replace("-", "_")     # bare hyphen
    s = s.replace(" ", "_")     # remaining spaces

    # Step 4 – collapse consecutive underscores to one
    s = re.sub(r"_+", "_", s)

    # Step 5 – strip leading/trailing underscores
    s = s.strip("_")

    return s


def to_ui(text: str) -> str:
    """
    Convert any ML class name OR JSON key → human-readable Title Case display.

    Examples
    --------
    to_ui("cowpea_bacterial_wilt")       → "Cowpea Bacterial Wilt"
    to_ui("Cowpea___Bacterial_Wilt")     → "Cowpea Bacterial Wilt"
    to_ui("soyabean - Yellow Mosaic")    → "Soyabean Yellow Mosaic"
    """
    if not text:
        return ""

    # Normalise to key first, then humanise — single code path, no duplication
    key = to_key(text)
    return key.replace("_", " ").title()


# ── Diagnostic helper (used by pesticide_service for logging) ─────────────────

def key_candidates(text: str) -> list[str]:
    """
    Return a list of progressively-relaxed lookup candidates for `text`.
    pesticide_service uses this to do safe fuzzy matching WITHOUT silent fallback.

    Order: exact → prefix-match attempts.
    The caller decides whether to accept a fuzzy hit or raise an error.
    """
    exact = to_key(text)
    parts = exact.split("_")

    candidates: list[str] = [exact]

    # Try progressively shorter prefixes (e.g. drop last token)
    for trim in range(1, len(parts)):
        candidates.append("_".join(parts[:len(parts) - trim]))

    return candidates  # deduplicated, order-preserved