// wellness.js - Wellness resources and tools
class WellnessResources {
    constructor() {
        this.mediaResources = {
            music: [
                {
                    title: "Deep Space Meditation",
                    url: "https://www.youtube.com/watch?v=example1",
                    type: "music",
                    duration: "30 min",
                    description: "Ambient space sounds for deep relaxation"
                },
                {
                    title: "Saturn Rings Symphony",
                    url: "https://www.youtube.com/watch?v=example2", 
                    type: "music",
                    duration: "45 min",
                    description: "Orchestral music inspired by Saturn's beauty"
                },
                {
                    title: "Cosmic Breathing Guide",
                    url: "https://www.youtube.com/watch?v=example3",
                    type: "guided",
                    duration: "20 min",
                    description: "Guided meditation with cosmic visuals"
                }
            ],
            videos: [
                {
                    title: "Grounding Techniques Demo",
                    url: "https://www.youtube.com/watch?v=example4",
                    type: "educational",
                    duration: "15 min",
                    description: "Learn practical grounding methods"
                },
                {
                    title: "Vorak Communication Basics",
                    url: "https://www.youtube.com/watch?v=example5",
                    type: "educational", 
                    duration: "25 min",
                    description: "Understanding Vorak non-verbal communication"
                },
                {
                    title: "Colony Adaptation Stories",
                    url: "https://www.youtube.com/watch?v=example6",
                    type: "inspirational",
                    duration: "40 min",
                    description: "Fellow colonists share their adaptation journeys"
                }
            ]
        };

        this.copingStrategies = {
            immediate: [
                {
                    title: "5-4-3-2-1 Grounding",
                    steps: [
                        "Name 5 things you can see around you",
                        "Identify 4 things you can touch", 
                        "Notice 3 things you can hear",
                        "Find 2 things you can smell",
                        "Name 1 thing you can taste"
                    ],
                    duration: "2-3 minutes"
                },
                {
                    title: "Temperature Shock",
                    steps: [
                        "Hold an ice cube in your hand",
                        "Splash cold water on your face",
                        "Place a cold compress on your neck",
                        "Focus on the physical sensation"
                    ],
                    duration: "1-2 minutes"
                }
            ],
            daily: [
                {
                    title: "Gratitude Journaling",
                    steps: [
                        "Write down three things you're grateful for",
                        "Include at least one colony-specific item", 
                        "Reflect on why you're grateful for each",
                        "Do this every morning or evening"
                    ],
                    duration: "5 minutes daily"
                },
                {
                    title: "Virtual Earth Connection",
                    steps: [
                        "Use the VR Earth simulation",
                        "Visit a favorite Earth location",
                        "Engage all your senses in the memory",
                        "Share the experience with a friend"
                    ],
                    duration: "10-15 minutes"
                }
            ]
        };

        this.communicationTips = [
            {
                category: "Vorak Interactions",
                tips: [
                    "Maintain respectful distance (2 meters minimum)",
                    "Avoid direct eye contact - they perceive it as aggressive",
                    "Use slow, deliberate hand gestures",
                    "Speak in calm, measured tones",
                    "Don't expect emotional reciprocity - it's cultural"
                ]
            },
            {
                category: "Conflict Resolution", 
                tips: [
                    "Use 'I feel' statements instead of accusations",
                    "Take breaks when emotions run high",
                    "Focus on the issue, not the person",
                    "Practice active listening - repeat back what you heard",
                    "Seek mediation for Vorak-human conflicts"
                ]
            },
            {
                category: "Social Connection",
                tips: [
                    "Join colony interest groups weekly",
                    "Schedule regular video calls with Earth contacts",
                    "Participate in cultural exchange programs",
                    "Share your adaptation journey in support groups",
                    "Practice small talk with fellow colonists"
                ]
            }
        ];
    }

    init() {
        this.renderMediaResources();
        this.renderCopingStrategies();
        this.renderCommunicationTips();
        this.setupEventListeners();
    }

    renderMediaResources() {
        const container = document.getElementById('mediaResources');
        if (!container) return;

        let html = `
            <div class="media-section">
                <h4><i class="fas fa-music"></i> Relaxation Music & Guided Meditation</h4>
                <div class="media-grid">
        `;

        this.mediaResources.music.forEach(media => {
            html += `
                <div class="media-card">
                    <div class="media-icon">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <div class="media-info">
                        <h5>${media.title}</h5>
                        <p>${media.description}</p>
                        <div class="media-meta">
                            <span class="duration">${media.duration}</span>
                            <a href="${media.url}" target="_blank" class="media-link">
                                <i class="fas fa-external-link-alt"></i> Listen
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <div class="media-section">
                <h4><i class="fas fa-video"></i> Educational Videos</h4>
                <div class="media-grid">
        `;

        this.mediaResources.videos.forEach(media => {
            html += `
                <div class="media-card">
                    <div class="media-icon">
                        <i class="fas fa-film"></i>
                    </div>
                    <div class="media-info">
                        <h5>${media.title}</h5>
                        <p>${media.description}</p>
                        <div class="media-meta">
                            <span class="duration">${media.duration}</span>
                            <a href="${media.url}" target="_blank" class="media-link">
                                <i class="fas fa-external-link-alt"></i> Watch
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    renderCopingStrategies() {
        const container = document.getElementById('copingStrategies');
        if (!container) return;

        let html = `
            <div class="strategies-section">
                <h4><i class="fas fa-first-aid"></i> Immediate Relief Techniques</h4>
                <div class="strategies-grid">
        `;

        this.copingStrategies.immediate.forEach(strategy => {
            html += `
                <div class="strategy-card">
                    <h5>${strategy.title}</h5>
                    <div class="duration-badge">${strategy.duration}</div>
                    <ol class="strategy-steps">
            `;
            
            strategy.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });

            html += `
                    </ol>
                    <button class="btn-outline start-strategy" data-strategy="${strategy.title}">
                        <i class="fas fa-play-circle"></i> Practice Now
                    </button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <div class="strategies-section">
                <h4><i class="fas fa-calendar-check"></i> Daily Practices</h4>
                <div class="strategies-grid">
        `;

        this.copingStrategies.daily.forEach(strategy => {
            html += `
                <div class="strategy-card">
                    <h5>${strategy.title}</h5>
                    <div class="duration-badge">${strategy.duration}</div>
                    <ol class="strategy-steps">
            `;
            
            strategy.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });

            html += `
                    </ol>
                    <button class="btn schedule-reminder" data-practice="${strategy.title}">
                        <i class="fas fa-bell"></i> Set Reminder
                    </button>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }

    renderCommunicationTips() {
        const container = document.getElementById('communicationTips');
        if (!container) return;

        let html = '<div class="tips-grid">';

        this.communicationTips.forEach(category => {
            html += `
                <div class="tips-category">
                    <h5><i class="fas fa-comments"></i> ${category.category}</h5>
                    <ul class="tips-list">
            `;
            
            category.tips.forEach(tip => {
                html += `<li>${tip}</li>`;
            });

            html += `</ul></div>`;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    setupEventListeners() {
        // Strategy practice buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.start-strategy')) {
                const strategy = e.target.closest('.start-strategy').dataset.strategy;
                this.startStrategyPractice(strategy);
            }
            
            if (e.target.closest('.schedule-reminder')) {
                const practice = e.target.closest('.schedule-reminder').dataset.practice;
                this.schedulePracticeReminder(practice);
            }
        });
    }

    startStrategyPractice(strategyName) {
        // Find the strategy
        let strategy;
        [...this.copingStrategies.immediate, ...this.copingStrategies.daily].forEach(s => {
            if (s.title === strategyName) strategy = s;
        });

        if (strategy) {
            // Create practice modal
            const modal = document.createElement('div');
            modal.className = 'practice-modal';
            modal.innerHTML = `
                <div class="practice-modal-content">
                    <div class="modal-header">
                        <h3>${strategy.title}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="practice-steps">
                            ${strategy.steps.map((step, index) => `
                                <div class="practice-step" data-step="${index}">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-text">${step}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="practice-controls">
                            <button class="btn" id="startPractice">Start Practice</button>
                            <button class="btn-outline" id="nextStep" style="display: none;">Next Step</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add practice functionality
            this.setupPracticeSession(modal, strategy);
        }
    }

    setupPracticeSession(modal, strategy) {
        let currentStep = 0;
        const steps = modal.querySelectorAll('.practice-step');
        const startBtn = modal.querySelector('#startPractice');
        const nextBtn = modal.querySelector('#nextStep');
        const closeBtn = modal.querySelector('.close-btn');

        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
            nextBtn.style.display = 'inline-block';
            this.activateStep(steps, currentStep);
        });

        nextBtn.addEventListener('click', () => {
            currentStep++;
            if (currentStep < steps.length) {
                this.activateStep(steps, currentStep);
            } else {
                this.completePractice(modal);
            }
        });

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
    }

    activateStep(steps, stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
            step.classList.toggle('completed', index < stepIndex);
        });
    }

    completePractice(modal) {
        modal.querySelector('.practice-controls').innerHTML = `
            <div class="practice-complete">
                <i class="fas fa-check-circle"></i>
                <h4>Practice Complete!</h4>
                <p>Great job completing this wellness practice.</p>
                <button class="btn" onclick="this.closest('.practice-modal').remove()">
                    Finish
                </button>
            </div>
        `;
    }

    schedulePracticeReminder(practiceName) {
        // In a real app, this would integrate with calendar APIs
        alert(`Reminder scheduled for "${practiceName}"! You'll receive a notification to practice this daily.`);
    }
}

// Initialize wellness resources
document.addEventListener('DOMContentLoaded', () => {
    window.wellnessResources = new WellnessResources();
    window.wellnessResources.init();
});