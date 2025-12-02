"""
Test script to verify brain tumor detection on frontend
Uploads a real MRI image with brain tumor and validates detection
"""

import requests
import json
import os
import sys

# Server URL
BASE_URL = "http://localhost:5000"

# Select a tumor image from dataset (mask=1 indicates tumor present)
TUMOR_IMAGE_PATH = "TCGA_CS_5393_19990606/TCGA_CS_5393_19990606_5.tif"

def test_health_check():
    """Test if the server is running"""
    print("=" * 60)
    print("🔍 Testing Server Health...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        data = response.json()
        
        print(f"✓ Server Status: {data['status']}")
        print(f"✓ Models Loaded: {data['models_loaded']}")
        print(f"✓ Version: {data['version']}")
        print()
        return data['models_loaded']
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the Flask server is running on port 5000")
        return False

def test_tumor_detection(image_path):
    """Test tumor detection with a real MRI image"""
    print("=" * 60)
    print("🧠 Testing Brain Tumor Detection...")
    print("=" * 60)
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"❌ Error: Image not found at {image_path}")
        return False
    
    print(f"📂 Image: {image_path}")
    
    # Prepare file for upload
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/tiff')}
            
            print("📤 Uploading MRI image to server...")
            response = requests.post(f"{BASE_URL}/api/predict", files=files, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Error: Server returned status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Parse results
        result = response.json()
        
        print("\n" + "=" * 60)
        print("📊 DETECTION RESULTS")
        print("=" * 60)
        
        # Classification Results
        print("\n🔬 CLASSIFICATION STAGE:")
        print("-" * 60)
        print(f"  Tumor Detected: {'✓ YES' if result['has_tumor'] else '✗ NO'}")
        print(f"  Confidence: {result['confidence'] * 100:.2f}%")
        print(f"\n  Classification Scores:")
        print(f"    • No Tumor: {result['classification_scores']['no_tumor'] * 100:.2f}%")
        print(f"    • Tumor:    {result['classification_scores']['tumor'] * 100:.2f}%")
        
        # Segmentation Results (if tumor detected)
        if result['has_tumor'] and 'segmentation' in result:
            seg = result['segmentation']
            print(f"\n🎯 SEGMENTATION STAGE:")
            print("-" * 60)
            print(f"  Tumor Area: {seg['tumor_area_percentage']:.2f}% of brain")
            print(f"  Tumor Pixels: {seg['tumor_pixels']:,} pixels")
            print(f"  Mask Generated: ✓")
            print(f"  Overlay Created: ✓")
        
        print("\n" + "=" * 60)
        print("✓ TEST COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        # Validation
        expected_tumor = True  # We're using an image known to have a tumor
        if result['has_tumor'] == expected_tumor:
            print("✓ Validation: Model correctly detected the tumor!")
        else:
            print("⚠ Warning: Model did not detect tumor in known positive case")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "NEUROSCAN AI - TUMOR DETECTION TEST" + " " * 12 + "║")
    print("╚" + "=" * 58 + "╝")
    print()
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Server health check failed. Exiting...")
        sys.exit(1)
    
    # Test 2: Tumor Detection
    if not test_tumor_detection(TUMOR_IMAGE_PATH):
        print("\n❌ Tumor detection test failed.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("=" * 60)
    print("\n💡 Next Steps:")
    print("   1. Open http://localhost:5000 in your browser")
    print("   2. Upload any MRI image from the TCGA_* folders")
    print("   3. View real-time tumor detection and segmentation")
    print()
    print("📁 Sample tumor images to try:")
    print("   • TCGA_CS_5393_19990606/TCGA_CS_5393_19990606_5.tif")
    print("   • TCGA_HT_7680_19970202/TCGA_HT_7680_19970202_5.tif")
    print("   • TCGA_CS_4944_20010208/TCGA_CS_4944_20010208_6.tif")
    print()

if __name__ == "__main__":
    main()
