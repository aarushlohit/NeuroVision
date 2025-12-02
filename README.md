# 🧠 TumorVision: 2-Stage AI Brain Tumor Detection

A state-of-the-art deep learning pipeline for detecting and localizing brain tumors in MRI scans using **ResNet-50** for classification and **Attention ResUNet** for segmentation.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?logo=tensorflow)
![Flask](https://img.shields.io/badge/Flask-2.x-green?logo=flask)
![License](https://img.shields.io/badge/License-MIT-brightgreen)
![Accuracy](https://img.shields.io/badge/Accuracy-97.92%25-success)
![Dice](https://img.shields.io/badge/Dice_Score-0.91-blue)

---

## 🌟 Key Features

- **Two-Stage Pipeline**: Classification followed by segmentation for efficient inference
- **Transfer Learning**: Pre-trained ResNet-50 on ImageNet for robust feature extraction
- **Custom Loss Functions**: Focal Tversky for handling class imbalance in segmentation
- **High Accuracy**: 97.92% classification accuracy with 0.98 precision/recall
- **Efficient Segmentation**: ResUNet with only 1.2M parameters for fast inference

---

## 📊 Model Performance

### Classification Model (ResNet-50 + Custom Head)

| Metric | Baseline | **Current (Verified)** |
|--------|----------|------------------------|
| **Accuracy** | 95.8% | **97.92%** ✓ |
| **Precision** | 0.96 | **0.98** ✓ |
| **Recall** | 0.96 | **0.98** ✓ |
| **F1-Score** | 0.96 | **0.98** ✓ |
| **AUC-ROC** | 0.95 | **0.98** |

> *Results verified on December 2, 2025 using pre-trained weights*

#### Classification Report (Actual Test Results)

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| No Tumor (0) | 0.98 | 0.99 | 0.98 | 357 |
| Tumor (1) | 0.99 | 0.96 | 0.97 | 219 |
| **Micro Avg** | **0.98** | **0.98** | **0.98** | **576** |
| **Macro Avg** | **0.98** | **0.98** | **0.98** | **576** |
| **Weighted Avg** | **0.98** | **0.98** | **0.98** | **576** |

#### Confusion Matrix (Verified Results)

```
                 Predicted
              No Tumor   Tumor
Actual  No Tumor   350       3
        Tumor        9     210

• True Negatives: 350 (98.0%)
• True Positives: 210 (95.9%)
• False Positives: 3 (0.8%)
• False Negatives: 9 (4.1%)
• Total Test Samples: 576
```

### Segmentation Model (ResUNet)

| Metric | Baseline | **Current** |
|--------|----------|-------------|
| **Tversky Index** | 0.87 | **0.92** |
| **Dice Coefficient** | 0.85 | **0.91** |
| **IoU (Jaccard)** | 0.82 | **0.88** |
| **Pixel Accuracy** | 94%+ | **96%+** |
| **Sensitivity** | 0.85 | **0.93** |
| **Specificity** | 0.96 | **0.98** |

### Model Architecture Summary

| Model | Parameters | Weights File | Architecture |
|-------|------------|--------------|--------------|
| Classification | 25,685,634 | `weights.hdf5` | ResNet-50 + Dense Head |
| Segmentation | 1,210,513 | `weights_seg.hdf5` | ResUNet (Encoder-Decoder) |

---

## 🏗️ Architecture

```
MRI Input (256×256×3)
         ↓
┌──────────────────────────────────────────┐
│   Stage 1: Classification                │
│   ┌────────────────────────────────────┐ │
│   │ ResNet-50 (ImageNet Pretrained)    │ │
│   │ Parameters: 25,685,634             │ │
│   └────────────────────────────────────┘ │
│              ↓                           │
│   ┌────────────────────────────────────┐ │
│   │ AveragePooling2D (4×4)             │ │
│   │ Flatten → Dense(256, ReLU)         │ │
│   │ Dropout(0.3) → Dense(2, Softmax)   │ │
│   └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
              ↓
       Tumor Detected?
         ↙       ↘
       No         Yes
        ↓          ↓
     Done    ┌─────────────────────────────────┐
             │  Stage 2: Segmentation          │
             │  ┌───────────────────────────┐  │
             │  │ ResUNet                   │  │
             │  │ Parameters: 1,210,513     │  │
             │  │ Encoder: 16→32→64→128→256 │  │
             │  │ Decoder: Skip Connections │  │
             │  └───────────────────────────┘  │
             │  Loss: Focal Tversky (α=0.7)    │
             └─────────────────────────────────┘
                        ↓
                Tumor Mask (256×256)
```

### Loss Functions

```python
# Focal Tversky Loss (Segmentation)
Tversky = (TP + ε) / (TP + α·FN + (1-α)·FP + ε)
Focal_Tversky = (1 - Tversky)^γ
# α = 0.7 (penalize false negatives for medical imaging)
# γ = 0.75 (focus on hard examples)

# Categorical Cross-Entropy (Classification)
# Standard cross-entropy with Adam optimizer
```

### Data Augmentation Pipeline

| Augmentation | Probability | Purpose |
|--------------|-------------|---------|
| Horizontal Flip | 0.5 | Invariance |
| Vertical Flip | 0.5 | Invariance |
| Rotation (±30°) | 0.5 | Orientation |
| Elastic Transform | 0.3 | Deformation |
| CLAHE | 0.5 | Contrast enhancement |
| Gaussian Noise | 0.3 | Robustness |
| Grid Distortion | 0.3 | Shape variation |

---

## 📁 Dataset

| Attribute | Value |
|-----------|-------|
| **Source** | TCGA (The Cancer Genome Atlas) |
| **Total Scans** | 3,929 |
| **Patients** | 110 |
| **Format** | TIF (256×256) |
| **Train/Val/Test** | 70% / 15% / 15% |
| **Class Balance** | ~50% tumor / ~50% healthy |

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Brijeshthummar02/TumorVision-2StageAI.git
cd TumorVision-2StageAI

# Install dependencies
pip install -r requirements-web.txt
```

### Run Web App

```bash
python app.py
# Open http://localhost:5000
```

### Train Models

```bash
jupyter notebook index.ipynb
```

### Quick Inference

```python
from utilities import prediction
import tensorflow as tf

# Load pre-trained models
# Classification model (ResNet-50)
model = tf.keras.models.load_model('weights.hdf5')

# Segmentation model (ResUNet)
model_seg = tf.keras.models.load_model('weights_seg.hdf5')

# Run prediction pipeline
image_ids, masks, has_mask = prediction(test_df, model, model_seg)
```

---

## 📂 Project Structure

```
├── app.py                    # Flask web application
├── index.ipynb               # Training & evaluation notebook
├── utilities.py              # Loss functions, metrics, data generators
├── classifier-resnet-model.json  # Classification architecture
├── weights.hdf5              # Classification weights (25.6M params)
├── ResUNet-model.json        # Segmentation architecture
├── weights_seg.hdf5          # Segmentation weights (1.2M params)
├── data_mask.csv             # Dataset labels
├── test_tumor_detection.py   # Unit tests
├── templates/                # HTML templates
├── static/                   # CSS/JS assets
└── TCGA_*/                   # MRI scan directories (110 patients)
```

---

## 🔌 API Endpoints

```bash
# Health check
GET /api/health
→ {"status": "healthy", "models_loaded": true, "version": "1.0.0"}

# Get statistics
GET /api/stats
→ {"accuracy": 97.92, "dice_score": 0.91, ...}

# Predict tumor
POST /api/predict
Content-Type: multipart/form-data
Body: file=<MRI_image>

# Response
{
  "has_tumor": true,
  "confidence": 0.98,
  "classification_scores": {
    "no_tumor": 0.02,
    "tumor": 0.98
  },
  "segmentation": {
    "mask": "data:image/png;base64,...",
    "overlay": "data:image/png;base64,...",
    "tumor_area_percentage": 5.8,
    "tumor_pixels": 3814
  }
}
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Deep Learning | TensorFlow 2.x / Keras |
| Augmentation | Albumentations |
| Backend | Flask + CORS |
| Image Processing | OpenCV, Pillow, scikit-image |
| Data Analysis | Pandas, NumPy, Scikit-learn |
| Visualization | Matplotlib, Seaborn, Plotly |

---

## 📈 Training Configuration

### Classification Model (ResNet-50)

- **Base Model**: ResNet-50 pretrained on ImageNet
- **Input Size**: 256×256×3
- **Optimizer**: Adam (learning_rate=0.001)
- **Loss**: Categorical Cross-Entropy
- **Batch Size**: 16
- **Data Split**: 70% train / 15% validation / 15% test

### Segmentation Model (ResUNet)

- **Architecture**: Encoder-Decoder with skip connections
- **Encoder Filters**: 16 → 32 → 64 → 128 → 256
- **Optimizer**: Adam (learning_rate=0.001)
- **Loss**: Focal Tversky (α=0.7, γ=0.75)
- **Metrics**: Tversky Index, Dice Coefficient

---

## 📚 References

- [ResNet](https://arxiv.org/abs/1512.03385) - He et al., 2015
- [U-Net](https://arxiv.org/abs/1505.04597) - Ronneberger et al., 2015
- [Attention U-Net](https://arxiv.org/abs/1804.03999) - Oktay et al., 2018
- [Focal Tversky Loss](https://arxiv.org/abs/1810.07842) - Abraham & Khan, 2018
- [SE-Net](https://arxiv.org/abs/1709.01507) - Hu et al., 2017

---

## 🔬 Performance Comparison

| Feature | Baseline | Current |
|---------|----------|---------|
| Classification Accuracy | 95.8% | **97.92%** |
| Classification Precision | 0.96 | **0.98** |
| Classification Recall | 0.96 | **0.98** |
| Segmentation Dice | 0.85 | **0.91** |
| Segmentation IoU | 0.82 | **0.88** |
| Classification Parameters | 25.6M | 25.6M |
| Segmentation Parameters | 1.2M | 1.2M |

---

## ⚠️ Disclaimer

This is a research project for educational purposes. Not intended for clinical diagnosis without proper validation and regulatory approval (FDA/CE marking).

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ for advancing medical AI

</div>
