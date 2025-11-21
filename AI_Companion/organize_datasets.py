"""
Organize downloaded datasets from datasets/downloads to proper locations
"""
import os
import shutil
from pathlib import Path

def organize_datasets():
    print("="*70)
    print("Organizing Downloaded Datasets")
    print("="*70)
    
    downloads = Path("datasets/downloads")
    
    # Organize CREMA-D
    print("\n📂 Organizing CREMA-D audio files...")
    cremad_source = downloads / "AudioWAV"
    cremad_dest = Path("datasets/CREMA-D/AudioWAV")
    
    if cremad_source.exists():
        cremad_dest.mkdir(parents=True, exist_ok=True)
        count = 0
        for wav_file in cremad_source.glob("*.wav"):
            shutil.copy2(wav_file, cremad_dest / wav_file.name)
            count += 1
        print(f"   ✓ Copied {count} CREMA-D audio files")
    
    # Organize RAVDESS - from Actor folders
    print("\n📂 Organizing RAVDESS audio files...")
    ravdess_dest = Path("datasets/RAVDESS/Audio")
    ravdess_dest.mkdir(parents=True, exist_ok=True)
    
    count = 0
    # Check Actor folders
    for actor_dir in downloads.glob("Actor_*"):
        if actor_dir.is_dir():
            for wav_file in actor_dir.glob("*.wav"):
                shutil.copy2(wav_file, ravdess_dest / wav_file.name)
                count += 1
    
    # Also check audio_speech_actors folder
    audio_actors = downloads / "audio_speech_actors_01-24"
    if audio_actors.exists():
        for actor_dir in audio_actors.glob("Actor_*"):
            if actor_dir.is_dir():
                for wav_file in actor_dir.glob("*.wav"):
                    dest_file = ravdess_dest / wav_file.name
                    if not dest_file.exists():
                        shutil.copy2(wav_file, dest_file)
                        count += 1
    
    print(f"   ✓ Copied {count} RAVDESS audio files")
    
    # Organize SAVEE (if exists)
    print("\n📂 Checking for SAVEE audio files...")
    savee_dest = Path("datasets/SAVEE/AudioData")
    savee_dest.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for wav_file in downloads.rglob("*.wav"):
        # SAVEE files have patterns like: a01.wav, d01.wav, etc.
        if len(wav_file.stem) == 3 and wav_file.stem[0] in 'adfhnsu':
            dest_file = savee_dest / wav_file.name
            if not dest_file.exists():
                shutil.copy2(wav_file, dest_file)
                count += 1
    
    if count > 0:
        print(f"   ✓ Copied {count} SAVEE audio files")
    else:
        print(f"   ⚠ No SAVEE files found (will download separately if needed)")
    
    print("\n" + "="*70)
    print("Verification")
    print("="*70)
    
    # Verify organized datasets
    datasets_check = [
        ("datasets/CREMA-D/AudioWAV", "CREMA-D Audio"),
        ("datasets/RAVDESS/Audio", "RAVDESS Audio"),
        ("datasets/SAVEE/AudioData", "SAVEE Audio"),
    ]
    
    for path, name in datasets_check:
        if os.path.exists(path):
            count = len([f for f in os.listdir(path) if f.endswith('.wav')])
            if count > 0:
                print(f"✓ {name}: {count} files")
            else:
                print(f"⚠ {name}: 0 files")
        else:
            print(f"✗ {name}: Not found")
    
    # Check CK+ (may need manual addition)
    print("\n📂 Checking CK+ facial images...")
    ck_path = "datasets/CK+/CK+48"
    total_images = 0
    if os.path.exists(ck_path):
        for emotion in os.listdir(ck_path):
            emotion_path = os.path.join(ck_path, emotion)
            if os.path.isdir(emotion_path):
                count = len([f for f in os.listdir(emotion_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
                total_images += count
                if count > 0:
                    print(f"   {emotion}: {count} images")
    
    if total_images == 0:
        print("⚠ CK+ images need to be added manually")
        print("   You mentioned they're in Downloads - please extract them to:")
        print("   datasets/CK+/CK+48/<emotion_folders>/")
    else:
        print(f"✓ CK+ Total: {total_images} images")
    
    print("\n" + "="*70)
    print("Organization Complete!")
    print("="*70)
    
    if total_images == 0:
        print("\n⚠ CK+ images still needed for facial emotion training")
        print("\nTo train speech emotion model only:")
        print("   python train_speech_model.py")
        print("\nTo train both models (after adding CK+):")
        print("   python train_model.py")
        print("   python train_speech_model.py")
    else:
        print("\n✅ All datasets ready!")
        print("\nNext steps:")
        print("   1. python train_model.py          # Train facial emotions")
        print("   2. python train_speech_model.py   # Train speech emotions")
        print("   3. python evaluate_models.py      # Check accuracy")

if __name__ == "__main__":
    organize_datasets()
