// NeuroScan AI - Interactive JavaScript

// ==================== Configuration ====================
const API_BASE_URL = 'http://localhost:5000/api';

// ==================== State Management ====================
let uploadedFile = null;
let currentResults = null;

// ==================== DOM Elements ====================
const elements = {
    // Upload elements
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    imagePreview: document.getElementById('imagePreview'),
    previewImage: document.getElementById('previewImage'),
    removeBtn: document.getElementById('removeBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    
    // Card states
    uploadCard: document.getElementById('uploadCard'),
    loadingCard: document.getElementById('loadingCard'),
    resultsContainer: document.getElementById('resultsContainer'),
    
    // Loading elements
    progressFill: document.getElementById('progressFill'),
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    
    // Doctor review elements
    doctorScanPreview: document.getElementById('doctorScanPreview'),
    thoughtBubble: document.getElementById('thoughtBubble'),
    doctorThought: document.getElementById('doctorThought'),
    action1: document.getElementById('action1'),
    action2: document.getElementById('action2'),
    action3: document.getElementById('action3'),
    action4: document.getElementById('action4'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn')
};

// Doctor thoughts for each stage
const doctorThoughts = [
    "Let me carefully examine this MRI scan...",
    "I'm checking the scan quality and resolution. Looks good!",
    "Now examining different brain regions for any abnormalities...",
    "Analyzing the tissue density and contrast patterns...",
    "Looking closely at potential areas of concern...",
    "Cross-referencing with our AI analysis...",
    "Almost done with my review. Preparing the diagnosis..."
];

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeAnimations();
    initializeAccordion();
    checkAPIHealth();
});

// ==================== Accordion Functionality ====================
function initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const content = accordionItem.querySelector('.accordion-content');
            const icon = this.querySelector('.fa-chevron-down');
            const isActive = accordionItem.classList.contains('active');
            
            // Close all other accordion items
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    const otherContent = item.querySelector('.accordion-content');
                    const otherIcon = item.querySelector('.fa-chevron-down');
                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                        otherContent.style.opacity = '0';
                    }
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Toggle current accordion item
            if (!isActive) {
                accordionItem.classList.add('active');
                if (content) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                }
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            } else {
                accordionItem.classList.remove('active');
                if (content) {
                    content.style.maxHeight = null;
                    content.style.opacity = '0';
                }
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
}

// ==================== Event Listeners ====================
function initializeEventListeners() {
    // Upload area click
    elements.uploadArea.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    
    // Remove button
    elements.removeBtn.addEventListener('click', handleRemoveImage);
    
    // Analyze button
    elements.analyzeBtn.addEventListener('click', handleAnalyze);
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Scroll spy for navigation
    window.addEventListener('scroll', handleScrollSpy);
}

// ==================== File Handling ====================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.style.borderColor = 'var(--planetary)';
    elements.uploadArea.style.backgroundColor = 'var(--sky)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.style.borderColor = 'var(--universe)';
    elements.uploadArea.style.backgroundColor = 'var(--gray-50)';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    handleDragLeave(e);
    
    const file = e.dataTransfer.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

function validateAndPreviewFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];
    
    const fileName = file.name.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
        showNotification('Please upload a valid image file (JPG, PNG, TIF, TIFF)', 'error');
        return;
    }
    
    // Validate file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
        showNotification('File size must be less than 16MB', 'error');
        return;
    }
    
    // Store file and preview
    uploadedFile = file;
    previewImage(file);
}

function previewImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        elements.previewImage.src = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.imagePreview.style.display = 'block';
        elements.analyzeBtn.disabled = false;
        
        // Animate preview
        elements.imagePreview.classList.add('fade-in');
    };
    
    reader.readAsDataURL(file);
}

function handleRemoveImage(e) {
    e.stopPropagation();
    
    uploadedFile = null;
    elements.fileInput.value = '';
    elements.previewImage.src = '';
    elements.uploadArea.style.display = 'block';
    elements.imagePreview.style.display = 'none';
    elements.analyzeBtn.disabled = true;
}

// ==================== Analysis ====================
async function handleAnalyze() {
    if (!uploadedFile) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
        // Make API request
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }
        
        const results = await response.json();
        currentResults = results;
        
        // Show results
        setTimeout(() => {
            showResults(results);
        }, 1000);
        
    } catch (error) {
        console.error('Analysis error:', error);
        hideLoadingState();
        showNotification(error.message || 'Failed to analyze image. Please try again.', 'error');
    }
}

function showLoadingState() {
    elements.uploadCard.style.display = 'none';
    elements.loadingCard.style.display = 'block';
    elements.resultsContainer.style.display = 'none';
    
    // Set the doctor's scan preview to the uploaded image
    if (uploadedFile && elements.doctorScanPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.doctorScanPreview.src = e.target.result;
        };
        reader.readAsDataURL(uploadedFile);
    }
    
    // Start doctor review animation
    startDoctorReviewAnimation();
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        elements.progressFill.style.width = `${Math.min(progress, 90)}%`;
        
        // Update steps
        if (progress >= 30) {
            elements.step1.classList.add('completed');
            elements.step1.querySelector('i').className = 'fas fa-check-circle';
            elements.step2.classList.add('active');
        }
        if (progress >= 60) {
            elements.step2.classList.add('completed');
            elements.step2.querySelector('i').className = 'fas fa-check-circle';
            elements.step3.classList.add('active');
        }
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 50);
}

// Doctor review animation controller
let doctorAnimationInterval = null;
let thoughtIndex = 0;
let actionIndex = 0;

function startDoctorReviewAnimation() {
    thoughtIndex = 0;
    actionIndex = 0;
    
    // Reset all actions
    const actions = [elements.action1, elements.action2, elements.action3, elements.action4];
    actions.forEach((action, idx) => {
        if (action) {
            action.classList.remove('active', 'completed');
            if (idx === 0) action.classList.add('active');
        }
    });
    
    // Update doctor thought
    if (elements.doctorThought) {
        elements.doctorThought.textContent = doctorThoughts[0];
    }
    
    // Start the animation cycle
    doctorAnimationInterval = setInterval(() => {
        // Update thoughts
        thoughtIndex = (thoughtIndex + 1) % doctorThoughts.length;
        if (elements.doctorThought) {
            // Fade out
            elements.thoughtBubble.style.opacity = '0.5';
            setTimeout(() => {
                elements.doctorThought.textContent = doctorThoughts[thoughtIndex];
                elements.thoughtBubble.style.opacity = '1';
            }, 200);
        }
        
        // Update actions (every other thought change)
        if (thoughtIndex % 2 === 0 && actionIndex < 3) {
            const actions = [elements.action1, elements.action2, elements.action3, elements.action4];
            
            // Mark current as completed
            if (actions[actionIndex]) {
                actions[actionIndex].classList.remove('active');
                actions[actionIndex].classList.add('completed');
            }
            
            // Move to next action
            actionIndex++;
            if (actions[actionIndex]) {
                actions[actionIndex].classList.add('active');
            }
        }
    }, 1500);
}

function stopDoctorReviewAnimation() {
    if (doctorAnimationInterval) {
        clearInterval(doctorAnimationInterval);
        doctorAnimationInterval = null;
    }
    
    // Mark all actions as completed
    const actions = [elements.action1, elements.action2, elements.action3, elements.action4];
    actions.forEach(action => {
        if (action) {
            action.classList.remove('active');
            action.classList.add('completed');
        }
    });
    
    // Final thought
    if (elements.doctorThought) {
        elements.doctorThought.textContent = "Analysis complete! Here are the results...";
    }
}

function hideLoadingState() {
    // Stop doctor review animation
    stopDoctorReviewAnimation();
    
    elements.uploadCard.style.display = 'block';
    elements.loadingCard.style.display = 'none';
    
    // Reset loading state
    elements.progressFill.style.width = '0%';
    elements.step1.classList.remove('completed', 'active');
    elements.step2.classList.remove('completed', 'active');
    elements.step3.classList.remove('completed', 'active');
    elements.step1.querySelector('i').className = 'fas fa-check-circle';
    elements.step2.querySelector('i').className = 'fas fa-spinner fa-spin';
    elements.step3.querySelector('i').className = 'fas fa-clock';
}

function showResults(results) {
    // Stop doctor animation
    stopDoctorReviewAnimation();
    
    // Complete progress
    elements.progressFill.style.width = '100%';
    elements.step3.classList.add('completed');
    elements.step3.querySelector('i').className = 'fas fa-check-circle';
    
    // Hide loading, show results
    setTimeout(() => {
        elements.loadingCard.style.display = 'none';
        elements.resultsContainer.style.display = 'block';
        
        // Generate results HTML
        const resultsHTML = generateResultsHTML(results);
        elements.resultsContainer.innerHTML = resultsHTML;
        
        // Animate results
        elements.resultsContainer.classList.add('fade-in');
        
        // Add event listener to new scan button
        const newScanBtn = document.getElementById('newScanBtn');
        if (newScanBtn) {
            newScanBtn.addEventListener('click', handleNewScan);
        }
        
        // Scroll to results
        elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    }, 500);
}

function generateResultsHTML(results) {
    const hasTumor = results.has_tumor;
    const confidence = (results.confidence * 100).toFixed(1);
    
    // Doctor's verdict based on results
    const doctorVerdict = hasTumor 
        ? `Based on my examination and the AI analysis, I've identified an abnormal tissue mass in the MRI scan. The ${confidence}% confidence level suggests this requires immediate attention. I recommend scheduling a follow-up consultation with a neurologist for further evaluation and to discuss treatment options.`
        : `After carefully reviewing this MRI scan along with our AI analysis, I'm pleased to report that no tumor indicators were detected. The brain tissue appears healthy with normal density patterns. However, please continue with regular check-ups as recommended by your primary physician.`;
    
    let html = `
        <!-- Doctor's Verdict Section -->
        <div class="doctor-verdict-section">
            <div class="verdict-header">
                <div class="verdict-doctor">
                    <div class="verdict-avatar">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div class="verdict-info">
                        <span class="verdict-name">Dr. Sarah Mitchell</span>
                        <span class="verdict-title">Senior Neuroradiologist</span>
                    </div>
                </div>
                <div class="verdict-stamp ${hasTumor ? 'concern' : 'clear'}">
                    <i class="fas ${hasTumor ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                    <span>${hasTumor ? 'Requires Attention' : 'All Clear'}</span>
                </div>
            </div>
            <div class="verdict-content">
                <i class="fas fa-quote-left"></i>
                <p>${doctorVerdict}</p>
            </div>
            <div class="verdict-signature">
                <div class="signature-line">
                    <span class="signature">Dr. S. Mitchell</span>
                    <span class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
        </div>
        
        <div class="results-header">
            <div class="result-badge ${hasTumor ? 'positive' : 'negative'}">
                <i class="fas ${hasTumor ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                <span>${hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}</span>
            </div>
            <div class="confidence-score">${confidence}%</div>
            <div class="confidence-label">AI Confidence Score</div>
        </div>
        
        <div class="results-grid">
            <div class="result-image-card">
                <img src="${results.original_image}" alt="Original MRI">
                <div class="result-image-label">Original MRI Scan</div>
            </div>
    `;
    
    if (hasTumor && results.segmentation) {
        html += `
            <div class="result-image-card">
                <img src="${results.segmentation.mask}" alt="Tumor Mask">
                <div class="result-image-label">AI-Generated Mask</div>
            </div>
            
            <div class="result-image-card">
                <img src="${results.segmentation.overlay}" alt="Tumor Overlay">
                <div class="result-image-label">Tumor Localization</div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    if (hasTumor && results.segmentation) {
        const tumorArea = results.segmentation.tumor_area_percentage.toFixed(2);
        const tumorPixels = results.segmentation.tumor_pixels;
        
        html += `
            <div class="tumor-details">
                <h3 style="text-align: center; margin-bottom: 2rem; color: var(--galaxy);">
                    <i class="fas fa-chart-pie" style="margin-right: 0.5rem;"></i>
                    Detailed Tumor Analysis
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-value">${tumorArea}%</div>
                        <div class="detail-label">Tumor Coverage</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${tumorPixels.toLocaleString()}</div>
                        <div class="detail-label">Affected Pixels</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${(results.classification_scores.tumor * 100).toFixed(1)}%</div>
                        <div class="detail-label">Detection Confidence</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="disclaimer-note">
            <i class="fas fa-info-circle"></i>
            <p><strong>Important:</strong> This analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.</p>
        </div>
        
        <button class="btn btn-primary btn-new-scan" id="newScanBtn">
            <i class="fas fa-plus"></i>
            Analyze Another Scan
        </button>
    `;
    
    return html;
}

function handleNewScan() {
    // Reset state
    handleRemoveImage({ stopPropagation: () => {} });
    
    // Show upload card
    elements.resultsContainer.style.display = 'none';
    elements.uploadCard.style.display = 'block';
    
    // Scroll to upload section
    document.getElementById('scan').scrollIntoView({ behavior: 'smooth' });
}

// ==================== Navigation ====================
function handleNavClick(e) {
    e.preventDefault();
    
    // Remove active class from all links
    elements.navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    e.target.classList.add('active');
    
    // Get target section
    const targetId = e.target.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleSmoothScroll(e) {
    // Get href from the clicked element or its parent (for nested elements like logo)
    let target = e.target;
    let href = target.getAttribute('href');
    
    // Check parent elements if no href found (for nested elements in anchor tags)
    while (!href && target.parentElement) {
        target = target.parentElement;
        href = target.getAttribute('href');
        if (target.tagName === 'A') break;
    }
    
    if (href && href.startsWith('#')) {
        e.preventDefault();
        
        // Special handling for #home - scroll to top
        if (href === '#home') {
            smoothScrollTo(0, 1200);
            return;
        }
        
        const targetSection = document.querySelector(href);
        
        if (targetSection) {
            const targetPosition = targetSection.offsetTop - 80; // Account for navbar
            smoothScrollTo(targetPosition, 1000);
        }
    }
}

// Enhanced smooth scroll with custom easing
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = easeOutQuint(progress);
        
        window.scrollTo(0, startPosition + distance * easeProgress);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function handleScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ==================== Animations ====================
function initializeAnimations() {
    // Animate stats on scroll
    const statValues = document.querySelectorAll('.stat-value [data-target], .stat-value[data-target]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statValues.forEach(stat => observer.observe(stat));
    
    // Initialize features section animations
    initializeFeaturesAnimations();
}

// Features Section Scroll Animations
function initializeFeaturesAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add delay based on index for staggered effect
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    };
    
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const scrollObserver = new IntersectionObserver(animateOnScroll, scrollObserverOptions);
    
    // Observe feature highlight card
    const highlightCard = document.querySelector('.feature-highlight-card');
    if (highlightCard) {
        highlightCard.classList.add('animate-ready');
        scrollObserver.observe(highlightCard);
    }
    
    // Observe bento cards
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        card.classList.add('animate-ready');
        scrollObserver.observe(card);
    });
    
    // Observe tech stack items
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.classList.add('animate-ready');
        scrollObserver.observe(item);
    });
    
    // Observe tech stack card
    const techStackCard = document.querySelector('.tech-stack-card');
    if (techStackCard) {
        techStackCard.classList.add('animate-ready');
        scrollObserver.observe(techStackCard);
    }
    
    // Add CSS for the animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .animate-ready {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-ready.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-highlight-card.animate-ready {
            transform: translateY(40px);
        }
        
        .bento-card.animate-ready {
            transform: translateY(25px) scale(0.98);
            transition: opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s ease;
        }
        
        .bento-card.animate-ready.animate-in {
            transform: translateY(0) scale(1);
        }
        
        .tech-item.animate-ready {
            transform: translateY(20px) scale(0.95);
        }
        
        .tech-item.animate-ready.animate-in {
            transform: translateY(0) scale(1);
        }
        
        .tech-stack-card.animate-ready {
            transform: translateY(35px);
        }
        
        /* Pipeline stage hover effect */
        .pipeline-stage .stage-icon {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        
        .pipeline-stage:hover .stage-icon {
            transform: scale(1.15) rotate(5deg);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        /* Bento card icon bounce */
        .bento-card:hover .bento-icon {
            animation: iconBounce 0.5s ease;
        }
        
        @keyframes iconBounce {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.15) rotate(-5deg); }
            50% { transform: scale(1.1) rotate(5deg); }
            75% { transform: scale(1.12) rotate(-3deg); }
        }
        
        /* Speed fill animation */
        .speed-fill {
            animation: speedPulse 2s ease-in-out infinite;
        }
        
        @keyframes speedPulse {
            0%, 100% { opacity: 1; width: 85%; }
            50% { opacity: 0.8; width: 80%; }
        }
        
        /* Tumor mark pulse */
        .overlay-tumor-mark {
            animation: tumorPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes tumorPulse {
            0%, 100% { transform: scale(1); opacity: 0.7; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
            50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 25px rgba(239, 68, 68, 0.7); }
        }
        
        /* Format badge hover */
        .format-badge {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .format-badge:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(51, 78, 172, 0.25);
        }
        
        /* Dataset stat slide */
        .dataset-stat {
            transition: transform 0.3s ease, background 0.3s ease;
        }
        
        /* Tech logo hover glow */
        .tech-logo {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .tech-item:hover .tech-logo {
            transform: scale(1.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        /* Pipeline connector animation */
        .connector-line-visual {
            position: relative;
            overflow: hidden;
        }
        
        .connector-line-visual::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        /* Bento metric glow on hover */
        .bento-card:hover .bento-metric {
            background: linear-gradient(135deg, rgba(51, 78, 172, 0.1), rgba(112, 152, 209, 0.1));
        }
        
        .bento-card:hover .metric-value {
            text-shadow: 0 0 20px rgba(51, 78, 172, 0.3);
        }
    `;
    document.head.appendChild(animationStyles);
}

function animateValue(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format based on value type
        if (element.textContent.includes('%')) {
            element.textContent = current.toFixed(1) + '%';
        } else if (target < 10) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// ==================== Notifications ====================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--success)' : 'var(--info)'};
        color: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    const icon = type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== API Health Check ====================
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy' && data.models_loaded) {
            console.log('✓ API is healthy and models are loaded');
        } else {
            console.warn('⚠ API is running but models may not be loaded');
            showNotification('System initializing. Please wait...', 'info');
        }
    } catch (error) {
        console.error('✗ Failed to connect to API:', error);
        showNotification('Unable to connect to server. Please ensure the Flask app is running.', 'error');
    }
}

// ==================== Utility Functions ====================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== Export for debugging ====================
window.NeuroScanAI = {
    checkHealth: checkAPIHealth,
    currentResults,
    uploadedFile
};

console.log('%c🧠 NeuroScan AI Initialized', 'color: #334EAC; font-size: 16px; font-weight: bold;');
console.log('%cReady for brain tumor detection!', 'color: #7098D1; font-size: 14px;');
