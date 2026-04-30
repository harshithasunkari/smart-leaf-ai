def to_key(text: str) -> str:
    return (
        text.strip()
        .lower()
        .replace("___", "_")
        .replace(" - ", "_")
        .replace("-", "_")
        .replace(" ", "_")
        .replace("__", "_")
    )


def to_ui(text: str) -> str:
    return (
        text.strip()
        .replace("_", " ")
        .title()
    )