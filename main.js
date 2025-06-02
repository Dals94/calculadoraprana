/**
 * Präna ROI Calculator - Main JavaScript File
 * 
 * Handles all interactive functionality including:
 * - Calculator form interactions
 * - ROI calculations
 * - Form validation and submission
 * - EmailJS integration
 * - UI state management
 */

// Global variables for calculator state
let calculatorData = {
    activeUsers: 5000,
    currentRetention: 60,
    monthlySpend: 0,
    acquisitionCost: 0,
    improvement: 25, // Default to moderate (25%)
    calculatedResults: null
};

// EmailJS configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_id', // Replace with your EmailJS service ID
    templateId: 'template_id', // Replace with your EmailJS template ID
    userId: 'user_id' // Replace with your EmailJS user ID
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeFormHandlers();
    initializeImprovementButtons();
});

/**
 * Initialize EmailJS with configuration
 */
function initializeEmailJS() {
    // Initialize EmailJS with user ID from environment or config
    emailjs.init(EMAILJS_CONFIG.userId);
}

/**
 * Smooth scroll to calculator section
 */
function scrollToCalculator() {
    const calculatorSection = document.getElementById('calculator');
    calculatorSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Initialize slider interactions and value updates
 */
function initializeSliders() {
    // Active users slider
    const activeUsersSlider = document.getElementById('activeUsers');
    const activeUsersValue = document.getElementById('activeUsersValue');
    
    activeUsersSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        calculatorData.activeUsers = value;
        activeUsersValue.textContent = formatNumber(value);
    });

    // Current retention slider
    const currentRetentionSlider = document.getElementById('currentRetention');
    const currentRetentionValue = document.getElementById('currentRetentionValue');
    
    currentRetentionSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        calculatorData.currentRetention = value;
        currentRetentionValue.textContent = value;
    });

    // Monthly spend input
    const monthlySpendInput = document.getElementById('monthlySpend');
    monthlySpendInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        calculatorData.monthlySpend = value;
    });

    // Acquisition cost input
    const acquisitionCostInput = document.getElementById('acquisitionCost');
    acquisitionCostInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        calculatorData.acquisitionCost = value;
    });
}

/**
 * Initialize improvement option buttons
 */
function initializeImprovementButtons() {
    const improvementButtons = document.querySelectorAll('.improvement-btn');
    
    improvementButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            improvementButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update calculator data
            calculatorData.improvement = parseInt(this.dataset.value);
        });
    });
}

/**
 * Initialize form handlers and validation
 */
function initializeFormHandlers() {
    // Calculate button handler
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', handleCalculateClick);

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactFormSubmit);

    // Modal cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    const modal = document.getElementById('formModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

/**
 * Handle calculate button click
 */
function handleCalculateClick() {
    // Validate calculator inputs
    if (!validateCalculatorInputs()) {
        return;
    }

    // Calculate ROI results
    calculatorData.calculatedResults = calculateROI();

    // Show form modal
    showModal();
}

/**
 * Validate calculator form inputs
 */
function validateCalculatorInputs() {
    const monthlySpend = calculatorData.monthlySpend;
    const acquisitionCost = calculatorData.acquisitionCost;

    if (monthlySpend <= 0) {
        alert('Por favor, ingresa el gasto mensual por usuario.');
        document.getElementById('monthlySpend').focus();
        return false;
    }

    if (acquisitionCost <= 0) {
        alert('Por favor, ingresa el costo de adquisición por usuario.');
        document.getElementById('acquisitionCost').focus();
        return false;
    }

    return true;
}

/**
 * Calculate ROI based on current form data
 */
function calculateROI() {
    const {
        activeUsers,
        currentRetention,
        monthlySpend,
        acquisitionCost,
        improvement
    } = calculatorData;

    // Calculate improvement factor (percentage to decimal)
    const improvementFactor = improvement / 100;

    // Calculate annual revenue increase
    // Formula: users × monthly spend × improvement × 12 months
    const annualRevenueIncrease = activeUsers * monthlySpend * improvementFactor * 12;

    // Calculate acquisition savings
    // Formula: users × acquisition cost × improvement
    const acquisitionSavings = activeUsers * acquisitionCost * improvementFactor;

    return {
        annualRevenueIncrease,
        acquisitionSavings,
        totalBenefit: annualRevenueIncrease + acquisitionSavings
    };
}

/**
 * Show the contact form modal
 */
function showModal() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('hidden');
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('fullName').focus();
    }, 100);
}

/**
 * Close the contact form modal
 */
function closeModal() {
    const modal = document.getElementById('formModal');
    modal.classList.add('hidden');
    
    // Clear form data
    document.getElementById('contactForm').reset();
}

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateContactForm()) {
        return;
    }

    // Show loading spinner
    showLoadingSpinner();

    // Simulate a brief processing time for better UX
    setTimeout(() => {
        // Hide modal and spinner
        closeModal();
        hideLoadingSpinner();
        
        // Show results
        displayResults();
    }, 1000);
}

/**
 * Validate contact form inputs
 */
function validateContactForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName) {
        alert('Por favor, ingresa tu nombre completo.');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!email || !isValidEmail(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        document.getElementById('email').focus();
        return false;
    }

    if (!phone) {
        alert('Por favor, ingresa tu número de teléfono.');
        document.getElementById('phone').focus();
        return false;
    }

    return true;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Prepare email data for EmailJS
 */
function prepareEmailData() {
    const {
        activeUsers,
        currentRetention,
        monthlySpend,
        acquisitionCost,
        improvement,
        calculatedResults
    } = calculatorData;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    return {
        to_email: 'david.lopez@pranagroup.mx',
        from_name: fullName,
        from_email: email,
        phone: phone,
        active_users: formatNumber(activeUsers),
        current_retention: `${currentRetention}%`,
        monthly_spend: `$${formatNumber(monthlySpend)} MXN`,
        acquisition_cost: `$${formatNumber(acquisitionCost)} MXN`,
        improvement_selected: `${improvement}%`,
        annual_revenue_increase: `$${formatNumber(calculatedResults.annualRevenueIncrease)} MXN`,
        acquisition_savings: `$${formatNumber(calculatedResults.acquisitionSavings)} MXN`,
        total_benefit: `$${formatNumber(calculatedResults.totalBenefit)} MXN`,
        timestamp: new Date().toLocaleString('es-MX')
    };
}

/**
 * Send email using EmailJS
 */
async function sendEmail(emailData) {
    return new Promise((resolve, reject) => {
        emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            emailData
        ).then(
            function(response) {
                console.log('Email sent successfully:', response);
                resolve(response);
            },
            function(error) {
                console.error('Email sending failed:', error);
                reject(error);
            }
        );
    });
}

/**
 * Show loading spinner
 */
function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.remove('hidden');
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.add('hidden');
}

/**
 * Display calculation results
 */
function displayResults() {
    const results = calculatorData.calculatedResults;
    
    // Update result values in DOM
    document.getElementById('revenueIncrease').textContent = 
        `$${formatCurrency(results.annualRevenueIncrease)} MXN`;
    
    document.getElementById('acquisitionSavings').textContent = 
        `$${formatCurrency(results.acquisitionSavings)} MXN`;
    
    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
function formatNumber(num) {
    return new Intl.NumberFormat('es-MX').format(num);
}

/**
 * Format currency with appropriate separators
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount));
}

/**
 * Utility function to handle keyboard navigation
 */
document.addEventListener('keydown', function(e) {
    // Close modal on Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('formModal');
        if (!modal.classList.contains('hidden')) {
            closeModal();
        }
    }
});

/**
 * Handle form input validation on blur
 */
document.addEventListener('blur', function(e) {
    if (e.target.classList.contains('form-input')) {
        validateInputOnBlur(e.target);
    }
}, true);

/**
 * Validate individual input on blur
 */
function validateInputOnBlur(input) {
    const value = input.value.trim();
    
    // Remove previous error states
    input.classList.remove('error');
    
    // Validate based on input type
    if (input.type === 'email' && value && !isValidEmail(value)) {
        input.classList.add('error');
    }
    
    if (input.required && !value) {
        input.classList.add('error');
    }
}

/**
 * Initialize tooltips and help text (if needed)
 */
function initializeTooltips() {
    // Add any tooltip functionality here if needed
    // This is a placeholder for future enhancements
}

/**
 * Track user interactions for analytics (placeholder)
 */
function trackUserInteraction(action, data = {}) {
    // Placeholder for analytics tracking
    // Could integrate with Google Analytics, Mixpanel, etc.
    console.log('User interaction:', action, data);
}

/**
 * Error handling for JavaScript errors
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e);
    // Could send error reports to monitoring service
});

/**
 * Handle offline/online status
 */
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
    alert('Se perdió la conexión a internet. Algunos servicios pueden no funcionar correctamente.');
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateROI,
        validateCalculatorInputs,
        validateContactForm,
        formatNumber,
        formatCurrency,
        isValidEmail
    };
}
