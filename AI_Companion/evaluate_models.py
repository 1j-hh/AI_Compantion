"""Evaluate trained facial and speech emotion models to diagnose accuracy issues."""
import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from PIL import Image
import os
import librosa
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns

# Import model architectures from robot_companion
import sys
sys.path.append(os.path.dirname(__file__))

# Define model architectures (copied from robot_companion.py)
class FacialExpressionCNN(nn.Module):
    def __init__(self, num_classes=7):
        super(FacialExpressionCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(128 * 6 * 6, 512)
        self.fc2 = nn.Linear(512, num_classes)
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = self.pool(torch.relu(self.conv3(x)))
        x = x.view(-1, 128 * 6 * 6)
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

class AudioCNN(nn.Module):
    def __init__(self, num_classes=6):
        super(AudioCNN, self).__init__()
        self.conv_layers = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        self.fc_layers = nn.Sequential(
            nn.Linear(128 * 8 * 8, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = x.view(x.size(0), -1)
        x = self.fc_layers(x)
        return x

class CKPlusDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.images = []
        self.labels = []
        self.emotion_map = {'anger': 0, 'contempt': 1, 'disgust': 2, 'fear': 3, 'happy': 4, 'sadness': 5, 'surprise': 6}
        
        for emotion_folder in os.listdir(root_dir):
            emotion_path = os.path.join(root_dir, emotion_folder)
            if os.path.isdir(emotion_path) and emotion_folder in self.emotion_map:
                for img_file in os.listdir(emotion_path):
                    if img_file.endswith(('.png', '.jpg', '.jpeg')):
                        self.images.append(os.path.join(emotion_path, img_file))
                        self.labels.append(self.emotion_map[emotion_folder])

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert('L')
        label = self.labels[idx]
        if self.transform:
            image = self.transform(image)
        return image, label

def evaluate_facial_model():
    """Evaluate facial emotion model."""
    print("\n=== Evaluating Facial Emotion Model ===")
    
    # Load model
    model = FacialExpressionCNN(num_classes=7)
    model.load_state_dict(torch.load('models/emotion_model.pth', map_location='cpu'))
    model.eval()
    
    # Prepare dataset
    transform = transforms.Compose([
        transforms.Grayscale(),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])
    
    dataset = CKPlusDataset('datasets/CK+/CK+48', transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False)
    
    # Evaluate
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in dataloader:
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    # Calculate metrics
    emotion_names = ['Anger', 'Contempt', 'Disgust', 'Fear', 'Happy', 'Sadness', 'Surprise']
    cm = confusion_matrix(all_labels, all_preds)
    
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=emotion_names, zero_division=0))
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=emotion_names, yticklabels=emotion_names)
    plt.title('Facial Emotion Recognition - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('facial_confusion_matrix.png')
    print(f"\nConfusion matrix saved to facial_confusion_matrix.png")
    
    # Calculate per-class accuracy
    print("\nPer-Class Accuracy:")
    for i, emotion in enumerate(emotion_names):
        if cm[i].sum() > 0:
            accuracy = cm[i][i] / cm[i].sum() * 100
            print(f"{emotion}: {accuracy:.2f}%")

def evaluate_speech_model():
    """Evaluate speech emotion model."""
    print("\n=== Evaluating Speech Emotion Model ===")
    
    # Load model
    model = AudioCNN(num_classes=6)
    model.load_state_dict(torch.load('models/speech_model.pth', map_location='cpu'))
    model.eval()
    
    # Load test data
    audio_dir = 'datasets/CREMA-D/AudioWAV'
    if not os.path.exists(audio_dir):
        print(f"Audio directory not found: {audio_dir}")
        return
    
    emotion_map = {'ANG': 0, 'DIS': 1, 'FEA': 2, 'HAP': 3, 'NEU': 4, 'SAD': 5}
    emotion_names = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad']
    
    all_preds = []
    all_labels = []
    
    # Process sample of audio files (limit to avoid long processing)
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith('.wav')][:500]
    
    print(f"Evaluating on {len(audio_files)} audio samples...")
    
    for audio_file in audio_files:
        # Parse emotion from filename (CREMA-D format: 1001_DFA_ANG_XX.wav)
        parts = audio_file.split('_')
        if len(parts) >= 3:
            emotion_code = parts[2]
            if emotion_code in emotion_map:
                label = emotion_map[emotion_code]
                
                # Load and process audio
                audio_path = os.path.join(audio_dir, audio_file)
                try:
                    audio, sr = librosa.load(audio_path, sr=16000, duration=3.0)
                    
                    # Extract mel spectrogram
                    mel_spec = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128, fmax=8000)
                    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
                    
                    # Resize to fixed shape
                    if mel_spec_db.shape[1] < 128:
                        pad_width = 128 - mel_spec_db.shape[1]
                        mel_spec_db = np.pad(mel_spec_db, ((0, 0), (0, pad_width)), mode='constant')
                    else:
                        mel_spec_db = mel_spec_db[:, :128]
                    
                    # Normalize
                    mel_spec_db = (mel_spec_db - mel_spec_db.mean()) / (mel_spec_db.std() + 1e-8)
                    
                    # Convert to tensor
                    input_tensor = torch.FloatTensor(mel_spec_db).unsqueeze(0).unsqueeze(0)
                    
                    # Predict
                    with torch.no_grad():
                        output = model(input_tensor)
                        _, predicted = torch.max(output.data, 1)
                        all_preds.append(predicted.item())
                        all_labels.append(label)
                except Exception as e:
                    continue
    
    if len(all_preds) == 0:
        print("No valid predictions made")
        return
    
    # Calculate metrics
    cm = confusion_matrix(all_labels, all_preds)
    
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=emotion_names, zero_division=0))
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', xticklabels=emotion_names, yticklabels=emotion_names)
    plt.title('Speech Emotion Recognition - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('speech_confusion_matrix.png')
    print(f"\nConfusion matrix saved to speech_confusion_matrix.png")
    
    # Calculate per-class accuracy
    print("\nPer-Class Accuracy:")
    for i, emotion in enumerate(emotion_names):
        if cm[i].sum() > 0:
            accuracy = cm[i][i] / cm[i].sum() * 100
            print(f"{emotion}: {accuracy:.2f}%")

if __name__ == "__main__":
    print("Starting model evaluation...")
    print("This will help identify which emotions are misclassified and why.")
    
    try:
        evaluate_facial_model()
    except Exception as e:
        print(f"Error evaluating facial model: {e}")
    
    try:
        evaluate_speech_model()
    except Exception as e:
        print(f"Error evaluating speech model: {e}")
    
    print("\nEvaluation complete!")
    print("\nRecommendations will be based on the confusion matrices:")
    print("1. If accuracy is low overall: need more data augmentation and longer training")
    print("2. If specific emotions are confused: need more samples of those emotions")
    print("3. If validation accuracy was high but real-world is low: need more diverse data (in-the-wild)")
