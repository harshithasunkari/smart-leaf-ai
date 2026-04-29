from fastapi import APIRouter

from app.schemas.schemas import ChatIn, ChatOut
from app.services.chat_service import chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=dict)
def chat(body: ChatIn):
    lang = body.language if body.language in ("en", "hi", "te") else "en"
    reply = chat_reply(body.message, lang)
    return {"success": True, "data": ChatOut(reply=reply).model_dump()}
