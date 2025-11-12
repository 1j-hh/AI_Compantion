// resources.js - Tab navigation and resource management
class ResourcesManager {
    constructor() {
        this.currentTab = 'breathing';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupBreathingExercises();
        this.loadUserPreferences();
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.resource-tab');
        const tabContents = document.querySelectorAll('.resource-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });

                this.currentTab = tabId;
                this.saveUserPreferences();
                
                // Special initialization for certain tabs
                if (tabId === 'breathing') {
                    this.initializeBreathingTab();
                }
            });
        });
    }

    setupBreathingExercises() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('breathing-btn')) {
                const technique = e.target.dataset.technique;
                this.startBreathingExercise(technique);
            }
        });
    }

    initializeBreathingTab() {
        // Add any breathing tab specific initialization here
        console.log('Breathing tab initialized');
    }

    startBreathingExercise(technique) {
        if (window.breathingApp) {
            window.breathingApp.startBreathingExercise(technique);
        } else {
            console.error('Breathing app not initialized');
            // Fallback: Show simple breathing instructions
            this.showSimpleBreathingGuide(technique);
        }
    }

    showSimpleBreathingGuide(technique) {
        const guides = {
            '478': {
                title: '4-7-8 Breathing',
                steps: [
                    'Empty your lungs completely',
                    'Breathe in through your nose for 4 seconds',
                    'Hold your breath for 7 seconds', 
                    'Exhale through your mouth for 8 seconds',
                    'Repeat this cycle 4 times'
                ]
            },
            'box': {
                title: 'Box Breathing',
                steps: [
                    'Sit upright in a comfortable position',
                    'Exhale completely through your mouth',
                    'Inhale through your nose for 4 seconds',
                    'Hold your breath for 4 seconds',
                    'Exhale through your mouth for 4 seconds',
                    'Hold empty for 4 seconds',
                    'Repeat for 5-10 cycles'
                ]
            },
            'coherent': {
                title: 'Coherent Breathing', 
                steps: [
                    'Find a comfortable seated position',
                    'Breathe in through your nose for 5 seconds',
                    'Breathe out through your nose for 5 seconds',
                    'Maintain this 5-second rhythm',
                    'Continue for 5-20 minutes',
                    'Focus on smooth, even breaths'
                ]
            }
        };

        const guide = guides[technique];
        if (guide) {
            const modal = document.createElement('div');
            modal.className = 'practice-modal';
            modal.innerHTML = `
                <div class="practice-modal-content">
                    <div class="modal-header">
                        <h3>${guide.title}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="practice-steps">
                            ${guide.steps.map((step, index) => `
                                <div class="practice-step" data-step="${index}">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-text">${step}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="practice-controls">
                            <button class="btn" onclick="this.closest('.practice-modal').remove()">
                                <i class="fas fa-check"></i> Got It
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.close-btn').addEventListener('click', () => {
                modal.remove();
            });
        }
    }

    saveUserPreferences() {
        const preferences = {
            lastTab: this.currentTab,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('companionResourcesPrefs', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        try {
            const prefs = JSON.parse(localStorage.getItem('companionResourcesPrefs'));
            if (prefs && prefs.lastTab) {
                // Find and click the corresponding tab
                const tab = document.querySelector(`.resource-tab[data-tab="${prefs.lastTab}"]`);
                if (tab) {
                    tab.click();
                }
            }
        } catch (error) {
            console.log('No saved preferences found');
        }
    }

    // Analytics for resource usage
    trackResourceUsage(resourceType, resourceId) {
        const usageData = {
            type: resourceType,
            id: resourceId,
            timestamp: new Date().toISOString(),
            userId: this.getUserId(),
            tab: this.currentTab
        };

        // In a real app, this would send to your analytics service
        console.log('Resource usage:', usageData);
        
        // Save to local storage for demo purposes
        this.saveUsageToLocal(usageData);
    }

    saveUsageToLocal(usageData) {
        let usageHistory = JSON.parse(localStorage.getItem('resourceUsageHistory') || '[]');
        usageHistory.push(usageData);
        
        // Keep only last 100 entries
        if (usageHistory.length > 100) {
            usageHistory = usageHistory.slice(-100);
        }
        
        localStorage.setItem('resourceUsageHistory', JSON.stringify(usageHistory));
    }

    getUserId() {
        // In a real app, this would get the actual user ID
        return 'user-' + (localStorage.getItem('userId') || 'demo');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resourcesManager = new ResourcesManager();
});