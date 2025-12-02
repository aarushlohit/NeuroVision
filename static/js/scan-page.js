/**
 * NeuroScan AI - Dedicated Scan Page JavaScript
 * Handles the immersive medical scanning experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = document.getElementById('uploadContent');
    const previewContent = document.getElementById('previewContent');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInfo = document.getElementById('fileInfo');
    const doctorMessage = document.getElementById('doctorMessage');
    
    // Step sections
    const stepUpload = document.getElementById('stepUpload');
    const stepAnalysis = document.getElementById('stepAnalysis');
    const stepResults = document.getElementById('stepResults');
    
    // Progress tracker
    const progressTracker = document.getElementById('progressTracker');
    
    // State
    let selectedFile = null;
    
    // Doctor messages for different states
    const doctorMessages = {
        welcome: "Hello! I'm ready to analyze your MRI scan. Please upload a brain MRI image and I'll provide a detailed analysis within seconds.",
        uploading: "Great! I can see you're uploading a scan. Let me take a look at it once it's ready.",
        ready: "Excellent! Your scan looks good. Click 'Begin Analysis' when you're ready for me to examine it.",
        analyzing: "I'm carefully analyzing your MRI scan using our advanced AI systems. This will just take a moment...",
        complete: "Analysis complete! I've prepared a detailed report with my findings."
    };

    // ==========================================
    // FILE UPLOAD HANDLING
    // ==========================================
    
    // Click to upload
    uploadZone.addEventListener('click', function(e) {
        if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
    
    // Handle file selection
    function handleFileSelect(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'];
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(file.type) && !['tif', 'tiff', 'jpg', 'jpeg', 'png'].includes(extension)) {
            showError('Invalid file type. Please upload a JPG, PNG, or TIFF image.');
            return;
        }
        
        // Validate file size (16MB max)
        if (file.size > 16 * 1024 * 1024) {
            showError('File too large. Maximum size is 16MB.');
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            uploadContent.style.display = 'none';
            previewContent.style.display = 'block';
            
            // Update file info
            const fileName = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
            const fileSize = formatFileSize(file.size);
            fileInfo.querySelector('.file-name').textContent = fileName;
            fileInfo.querySelector('.file-size').textContent = fileSize;
            
            // Enable analyze button
            analyzeBtn.disabled = false;
            
            // Update doctor message
            updateDoctorMessage(doctorMessages.ready);
        };
        reader.readAsDataURL(file);
    }
    
    // Remove image
    removeImageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        resetUpload();
    });
    
    function resetUpload() {
        selectedFile = null;
        fileInput.value = '';
        previewImage.src = '';
        uploadContent.style.display = 'block';
        previewContent.style.display = 'none';
        analyzeBtn.disabled = true;
        updateDoctorMessage(doctorMessages.welcome);
    }
    
    // ==========================================
    // ANALYSIS HANDLING
    // ==========================================
    
    analyzeBtn.addEventListener('click', function() {
        if (!selectedFile) return;
        
        // Show loading state on button
        const btnContent = analyzeBtn.querySelector('.btn-content');
        const btnLoader = analyzeBtn.querySelector('.btn-loader');
        btnContent.style.display = 'none';
        btnLoader.style.display = 'flex';
        analyzeBtn.disabled = true;
        
        // Transition to analysis step
        setTimeout(() => {
            showStep('analysis');
            startAnalysis();
        }, 500);
    });
    
    function showStep(step) {
        // Hide all steps
        stepUpload.classList.remove('active');
        stepUpload.style.display = 'none';
        stepAnalysis.classList.remove('active');
        stepAnalysis.style.display = 'none';
        stepResults.classList.remove('active');
        stepResults.style.display = 'none';
        
        // Update progress tracker
        updateProgressTracker(step);
        
        // Show selected step
        switch(step) {
            case 'upload':
                stepUpload.style.display = 'block';
                setTimeout(() => stepUpload.classList.add('active'), 50);
                break;
            case 'analysis':
                stepAnalysis.style.display = 'block';
                setTimeout(() => stepAnalysis.classList.add('active'), 50);
                break;
            case 'results':
                stepResults.style.display = 'block';
                setTimeout(() => stepResults.classList.add('active'), 50);
                break;
        }
    }
    
    function updateProgressTracker(currentStep) {
        const steps = progressTracker.querySelectorAll('.progress-step');
        const stepMap = { 'checkin': 1, 'upload': 2, 'analysis': 3, 'results': 4 };
        const currentIndex = stepMap[currentStep] || 2;
        
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < currentIndex) {
                step.classList.add('completed');
            } else if (stepNum === currentIndex) {
                step.classList.add('active');
            }
        });
    }
    
    function startAnalysis() {
        // Set scan images
        const scanningImage = document.getElementById('scanningImage');
        const monitorScanImage = document.getElementById('monitorScanImage');
        
        if (previewImage.src) {
            scanningImage.src = previewImage.src;
            monitorScanImage.src = previewImage.src;
        }
        
        // Reset analysis steps
        const analysisSteps = document.querySelectorAll('.analysis-step');
        analysisSteps.forEach(step => {
            step.classList.remove('active', 'completed');
            const check = step.querySelector('.step-check i');
            check.className = 'fas fa-clock';
        });
        
        // Start with first step
        const step1 = document.getElementById('analysisStep1');
        step1.classList.add('active');
        step1.querySelector('.step-check i').className = 'fas fa-circle-notch fa-spin';
        
        // Progress animation
        let progress = 0;
        const progressBar = document.getElementById('analysisProgress');
        const progressPercent = document.getElementById('progressPercent');
        
        const progressInterval = setInterval(() => {
            progress += 1;
            progressBar.style.width = progress + '%';
            progressPercent.textContent = progress + '%';
            
            // Update steps based on progress
            if (progress === 25) {
                completeStep('analysisStep1');
                activateStep('analysisStep2');
                document.getElementById('analysisStage').textContent = 'Classification';
                document.getElementById('activeModel').textContent = 'ResNet-50';
            } else if (progress === 50) {
                completeStep('analysisStep2');
                activateStep('analysisStep3');
                document.getElementById('analysisStage').textContent = 'Segmentation';
                document.getElementById('activeModel').textContent = 'ResUNet';
            } else if (progress === 75) {
                completeStep('analysisStep3');
                activateStep('analysisStep4');
                document.getElementById('analysisStage').textContent = 'Finalizing';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                completeStep('analysisStep4');
                document.getElementById('analysisStatus').innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Complete';
                
                // Perform actual API call
                performAnalysis();
            }
        }, 30); // ~3 seconds total
    }
    
    function completeStep(stepId) {
        const step = document.getElementById(stepId);
        step.classList.remove('active');
        step.classList.add('completed');
        step.querySelector('.step-check i').className = 'fas fa-check';
    }
    
    function activateStep(stepId) {
        const step = document.getElementById(stepId);
        step.classList.add('active');
        step.querySelector('.step-check i').className = 'fas fa-circle-notch fa-spin';
    }
    
    function performAnalysis() {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        fetch('/api/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
                showStep('upload');
                resetAnalyzeButton();
                return;
            }
            
            // Transition to results
            setTimeout(() => {
                showStep('results');
                displayResults(data);
            }, 500);
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Analysis failed. Please try again.');
            showStep('upload');
            resetAnalyzeButton();
        });
    }
    
    // ==========================================
    // RESULTS DISPLAY
    // ==========================================
    
    function displayResults(data) {
        const hasTumor = data.has_tumor;
        const confidence = (data.confidence * 100).toFixed(2);
        
        // Update banner
        const resultStatus = document.getElementById('resultStatus');
        const statusIcon = resultStatus.querySelector('.status-icon i');
        const statusMessage = document.getElementById('statusMessage');
        
        if (hasTumor) {
            resultStatus.classList.add('tumor-detected');
            statusIcon.className = 'fas fa-exclamation-triangle';
            resultStatus.querySelector('h2').textContent = 'Tumor Detected';
            statusMessage.textContent = 'Abnormal tissue growth identified in scan';
        } else {
            resultStatus.classList.remove('tumor-detected');
            statusIcon.className = 'fas fa-check-circle';
            resultStatus.querySelector('h2').textContent = 'No Tumor Detected';
            statusMessage.textContent = 'Scan appears healthy - no abnormalities found';
        }
        
        // Animate confidence ring
        animateConfidenceRing(confidence);
        
        // Update report metadata
        document.getElementById('reportId').textContent = 'Report #NS-' + Date.now().toString().slice(-8);
        document.getElementById('reportDate').textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set images
        document.getElementById('originalImage').src = data.original_image;
        
        // Diagnosis card
        const diagnosisCard = document.getElementById('diagnosisCard');
        const diagnosisIcon = document.getElementById('diagnosisIcon');
        const diagnosisTitle = document.getElementById('diagnosisTitle');
        const diagnosisDescription = document.getElementById('diagnosisDescription');
        
        if (hasTumor) {
            diagnosisCard.classList.add('tumor');
            diagnosisIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            diagnosisIcon.style.background = '#f59e0b';
            diagnosisTitle.textContent = 'Tumor Detected';
            diagnosisDescription.textContent = 'The AI analysis has identified abnormal tissue growth in the scanned brain region. The segmentation model has mapped the tumor boundaries for further examination.';
        } else {
            diagnosisCard.classList.remove('tumor');
            diagnosisIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            diagnosisIcon.style.background = '#10b981';
            diagnosisTitle.textContent = 'No Tumor Detected';
            diagnosisDescription.textContent = 'The AI analysis indicates no abnormal growths or tumors in the scanned brain region. The scan appears healthy.';
        }
        
        // Update probability scores
        const tumorProb = (data.classification_scores.tumor * 100).toFixed(2);
        const healthyProb = (data.classification_scores.no_tumor * 100).toFixed(2);
        
        document.getElementById('tumorScore').textContent = tumorProb + '%';
        document.getElementById('healthyScore').textContent = healthyProb + '%';
        
        setTimeout(() => {
            document.getElementById('tumorScoreBar').style.width = tumorProb + '%';
            document.getElementById('healthyScoreBar').style.width = healthyProb + '%';
        }, 300);
        
        // Handle segmentation results (only if tumor detected)
        const maskContainer = document.getElementById('maskContainer');
        const overlayContainer = document.getElementById('overlayContainer');
        const tumorMetrics = document.getElementById('tumorMetrics');
        
        if (hasTumor && data.segmentation) {
            maskContainer.style.display = 'block';
            overlayContainer.style.display = 'block';
            tumorMetrics.style.display = 'block';
            
            document.getElementById('maskImage').src = data.segmentation.mask;
            document.getElementById('overlayImage').src = data.segmentation.overlay;
            
            document.getElementById('tumorAreaPercent').textContent = data.segmentation.tumor_area_percentage.toFixed(2) + '%';
            document.getElementById('tumorPixels').textContent = data.segmentation.tumor_pixels.toLocaleString();
        } else {
            maskContainer.style.display = 'none';
            overlayContainer.style.display = 'none';
            tumorMetrics.style.display = 'none';
        }
    }
    
    function animateConfidenceRing(confidence) {
        const ring = document.getElementById('confidenceRing');
        const valueDisplay = document.getElementById('confidenceValue');
        const circumference = 2 * Math.PI * 45; // radius is 45
        const offset = circumference - (confidence / 100) * circumference;
        
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            ring.style.strokeDashoffset = offset;
        }, 100);
        
        // Animate number
        let current = 0;
        const increment = confidence / 50;
        const counter = setInterval(() => {
            current += increment;
            if (current >= confidence) {
                current = confidence;
                clearInterval(counter);
            }
            valueDisplay.textContent = Math.round(current);
        }, 20);
    }
    
    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function updateDoctorMessage(message) {
        const typingIndicator = document.getElementById('typingIndicator');
        const messageP = doctorMessage;
        
        // Show typing indicator
        typingIndicator.style.display = 'flex';
        messageP.style.display = 'none';
        
        // After typing animation, show message
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            messageP.style.display = 'block';
            messageP.textContent = message;
        }, 1000);
    }
    
    function showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    function resetAnalyzeButton() {
        const btnContent = analyzeBtn.querySelector('.btn-content');
        const btnLoader = analyzeBtn.querySelector('.btn-loader');
        btnContent.style.display = 'flex';
        btnLoader.style.display = 'none';
        analyzeBtn.disabled = false;
    }
    
    // New Scan button
    const newScanBtn = document.getElementById('newScanBtn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', function() {
            resetUpload();
            resetAnalyzeButton();
            showStep('upload');
        });
    }
    
    // Download Report button (placeholder)
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function() {
            // For now, just show a message
            alert('Report download functionality coming soon!');
        });
    }
    
    // Add CSS for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
