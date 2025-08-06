import os
import torch
import pickle
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "saved_models", "distilbert_30_epochs_original")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class ModelService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.label_encoder = None
        self.load_model()

    def load_model(self):
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        self.model.to(DEVICE)
        self.model.eval()

        label_encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
        with open(label_encoder_path, "rb") as f:
            self.label_encoder = pickle.load(f)

        print("✅ ModelService loaded model, tokenizer, label encoder.")

    def is_model_ready(self):
        return self.model is not None and self.tokenizer is not None and self.label_encoder is not None

    def predict(self, subject: str, body: str):
        if not self.is_model_ready():
            raise RuntimeError("ModelService not ready")
        text = f"{subject} {body}"
        inputs = self.tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits.cpu().numpy()
        pred_idx = int(np.argmax(logits, axis=1)[0])
        queue_label = self.label_encoder.inverse_transform([pred_idx])[0]
        return {"queue": queue_label}

model_service = ModelService()
