import os
import cv2
from collections import defaultdict

DATASET_PATH = "D:\smart-leaf-ai\cleaned_data"   # 🔥 your folder name

splits = ["train", "val", "test"]

print("\n🔍 DATASET VALIDATION STARTED...\n")

total_classes = set()
class_counts = defaultdict(dict)
corrupt_images = []

# =========================
# CHECK STRUCTURE
# =========================
for split in splits:
    split_path = os.path.join(DATASET_PATH, split)

    if not os.path.exists(split_path):
        print(f"❌ Missing folder: {split}")
        continue

    print(f"\n📁 Checking {split.upper()}")

    for cls in os.listdir(split_path):
        class_path = os.path.join(split_path, cls)

        if not os.path.isdir(class_path):
            continue

        total_classes.add(cls)

        images = os.listdir(class_path)
        count = 0

        for img_name in images:
            img_path = os.path.join(class_path, img_name)

            try:
                img = cv2.imread(img_path)
                if img is None:
                    corrupt_images.append(img_path)
                else:
                    count += 1
            except:
                corrupt_images.append(img_path)

        class_counts[cls][split] = count

        print(f"   {cls:35s} → {count} images")

# =========================
# SUMMARY
# =========================
print("\n" + "="*60)
print("📊 FINAL SUMMARY")
print("="*60)

min_images = float('inf')
max_images = 0

for cls in sorted(total_classes):
    total = sum(class_counts[cls].values())
    min_images = min(min_images, total)
    max_images = max(max_images, total)

    print(f"{cls:35s} → Total: {total}")

print("\n📌 Total Classes:", len(total_classes))
print("📌 Min images/class:", min_images)
print("📌 Max images/class:", max_images)

if min_images > 0:
    imbalance_ratio = round(max_images / min_images, 2)
    print("📌 Imbalance Ratio:", imbalance_ratio)

# =========================
# CORRUPT IMAGES
# =========================
print("\n🚨 CORRUPTED IMAGES CHECK")

if len(corrupt_images) == 0:
    print("✅ No corrupted images found")
else:
    print(f"❌ Found {len(corrupt_images)} corrupted images")
    for img in corrupt_images[:10]:
        print("   ", img)

# =========================
# FINAL STATUS
# =========================
print("\n🎯 FINAL STATUS")

if len(total_classes) < 2:
    print("❌ Not enough classes")
elif min_images < 20:
    print("⚠️ Some classes too small (<20 images)")
elif imbalance_ratio > 10:
    print("⚠️ High imbalance detected")
else:
    print("✅ DATASET LOOKS GOOD FOR TRAINING")

print("\n🔍 VALIDATION COMPLETE\n")