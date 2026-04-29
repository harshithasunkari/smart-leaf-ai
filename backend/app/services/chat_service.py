import re


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").lower()).strip()


REPLIES = {
    "en": {
        "app": "Smart Leaf Advisor helps you detect legume leaf diseases, review severity from model confidence, and get rule-based pesticide guidance. Use Single or Multi image detection, then Pesticide recommendation. History saves your cases.",
        "disease": "Open Single or Multi detection, upload clear leaf photos (sunlit, in focus). The app shows disease name, confidence %, and severity band: Low <60%, Medium 60–80%, High >80% of confidence.",
        "pesticide": "Use Pesticide recommendation: enter disease, crop, soil, area (hectares), and stage. You will get product class example, total grams for the area, spray interval guidance, and precautions—always follow your local product label.",
        "fail": "If control fails: confirm the diagnosis with new images, check coverage and timing, rotate modes of action where legal, reduce leaf wetness, and contact extension services. The History tab notes explanations per disease rules.",
        "default": "Ask about disease details, pesticide usage, what to do if sprays fail, or how to use this app. You can switch language in the chat header.",
    },
    "hi": {
        "app": "स्मार्ट लीफ एडवाइज़र दाल वर्गीय पौधों की पत्तियों में रोग पहचान, विश्वास स्कोर से गंभीरता, और नियम-आधारित कीटनाशक सुझाव देता है। सिंगल/मल्टी इमेज के बाद कीटनाशक अनुशंसा उपयोग करें। इतिहास सहेजा जाता है।",
        "disease": "एकल या कई छवियों से जाँच करें—स्पष्ट, फोकस्ड पत्ती की फोटो अपलोड करें। ऐप रोग नाम, विश्वास %, और गंभीरता दिखाता है: कम <60%, मध्यम 60–80%, अधिक >80%।",
        "pesticide": "कीटनाशك अनुशंसा में रोग, फसल, मिट्टी, क्षेत्र (हेक्टेयर), और चरण भरें। उत्पाद श्रेणी, कुल ग्राम, स्प्रे अंतराल संकेत, और सावधानियाँ मिलेंगी—स्थानीय लेबल अनिवार्य है।",
        "fail": "यदि असर न हो: नई तस्वीरों से जाँच करें, छिड़काव कवरेज और समय देखें, कानूनी रोटेशन करें, पत्ती गीलापन कम करें, विशेषज्ञ से संपर्क करें।",
        "default": "रोग विवरण, कीटनाशक उपयोग, असफल उपचार, या ऐप उपयोग के बारे में पूछें। भाषा चुनें।",
    },
    "te": {
        "app": "స్మార్ట్ లీఫ్ అడ్వైజర్ పప్పు దినుసుల ఆకు రోగ గుర్తింపు, నమ్మక స్కోరు ప్రకారం తీవ్రత, మరియు నియమాధారిత పురుగుమందు సూచనలు ఇస్తుంది। సింగిల్/మల్టీ చిత్రం తర్వాత సిఫార్సు వాడండి. చరిత్ర భద్రపరుస్తుంది.",
        "disease": "సవ్యమైన ఆకు ఫోటోలు అప్‌లోడ్ చేయండి. రోగం పేరు, నమ్మకం %, తీవ్రత: Low <60%, Medium 60–80%, High >80%.",
        "pesticide": "రోగం, పంట, నేల, భూభాగం (హెక్టార్లు), దశ ఇవ్వండి. ఉత్పత్తి వర్గం, గ్రాములు, స్ప్రే గ్యాప్, జాగ్రత్తలు వస్తాయి—స్థానిక లేబుల్ పాటించండి.",
        "fail": "ఫలితం లేకపోతే: కొత్త చిత్రాలతో నిర్ధారించండి, స్ప్రే కవరేజ్ చూడండి, రోటేషన్ పాటించండి, తడి నియంత్రించండి, నిపుణులను సంప్రదించండి.",
        "default": "రోగ వివరాలు, మందు వాడకం, విఫలమైతే ఏమి చేయాలి, యాప్ గురించి అడగండి. భాష మార్చండి.",
    },
}


def chat_reply(message: str, lang: str) -> str:
    lang = lang if lang in REPLIES else "en"
    t = message or ""
    n = _norm(t)
    bucket = REPLIES[lang]

    if any(k in n for k in ["pesticide", "spray", "dose", "dosage", "कीट", "मंदు", "పురుగ"]):
        return bucket["pesticide"]
    if any(k in n for k in ["fail", "not work", "असर", "విఫల", "చెడు"]):
        return bucket["fail"]
    if any(k in n for k in ["disease", "symptom", "लक्षण", "రోగ", "నిర్ధారణ"]):
        return bucket["disease"]
    if any(k in n for k in ["app", "how to", "कैसे", "ఎలా", "guide", "use"]):
        return bucket["app"]
    return bucket["default"]
