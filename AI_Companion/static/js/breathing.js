// breathing.js - Interactive breathing exercises
class BreathingTechniques {
    constructor() {
        this.currentExercise = null;
        this.isRunning = false;
        this.animationFrame = null;
    }

    init() {
        this.setupEventListeners();
        this.createBreathingVisualization();
    }

    setupEventListeners() {
        // Breathing exercise buttons
        document.querySelectorAll('.breathing-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const technique = e.target.dataset.technique;
                this.startBreathingExercise(technique);
            });
        });

        // Close breathing modal
        document.getElementById('closeBreathing')?.addEventListener('click', () => {
            this.stopBreathingExercise();
        });
    }

    createBreathingVisualization() {
        const container = document.getElementById('breathingVisualization');
        if (!container) return;

        container.innerHTML = `
            <div class="breathing-circle">
                <div class="circle-outer"></div>
                <div class="circle-inner"></div>
                <div class="breathing-text">
                    <div class="instruction">Breathe In</div>
                    <div class="timer">4</div>
                </div>
            </div>
            <div class="breathing-controls">
                <button class="btn" id="startBreathing">Start Exercise</button>
                <button class="btn-outline" id="pauseBreathing">Pause</button>
            </div>
            <div class="breathing-stats">
                <div class="breath-count">Breaths: <span>0</span></div>
                <div class="exercise-time">Time: <span>00:00</span></div>
            </div>
        `;
    }

    startBreathingExercise(technique) {
        this.currentExercise = technique;
        this.isRunning = true;
        
        // Show breathing modal
        this.showBreathingModal();
        
        // Start animation based on technique
        switch(technique) {
            case '478':
                this.start478Breathing();
                break;
            case 'box':
                this.startBoxBreathing();
                break;
            case 'coherent':
                this.startCoherentBreathing();
                break;
        }
    }

    start478Breathing() {
        const stages = [
            { text: 'Breathe In Through Nose', duration: 4, action: 'expand' },
            { text: 'Hold Breath', duration: 7, action: 'hold' },
            { text: 'Exhale Through Mouth', duration: 8, action: 'contract' }
        ];
        
        this.runBreathingCycle(stages, '4-7-8 Breathing');
    }

    startBoxBreathing() {
        const stages = [
            { text: 'Breathe In', duration: 4, action: 'expand' },
            { text: 'Hold Breath', duration: 4, action: 'hold' },
            { text: 'Exhale Slowly', duration: 4, action: 'contract' },
            { text: 'Hold Empty', duration: 4, action: 'hold' }
        ];
        
        this.runBreathingCycle(stages, 'Box Breathing');
    }

    startCoherentBreathing() {
        const stages = [
            { text: 'Breathe In', duration: 5, action: 'expand' },
            { text: 'Exhale Slowly', duration: 5, action: 'contract' }
        ];
        
        this.runBreathingCycle(stages, 'Coherent Breathing');
    }

    runBreathingCycle(stages, exerciseName) {
        let currentStage = 0;
        let breathCount = 0;
        let startTime = Date.now();
        
        const updateDisplay = () => {
            if (!this.isRunning) return;
            
            const stage = stages[currentStage];
            const circle = document.querySelector('.breathing-circle');
            const instruction = document.querySelector('.instruction');
            const timer = document.querySelector('.timer');
            
            // Update text
            instruction.textContent = stage.text;
            timer.textContent = stage.duration;
            
            // Animate circle
            circle.className = `breathing-circle ${stage.action}`;
            
            // Stage timer
            setTimeout(() => {
                if (!this.isRunning) return;
                
                currentStage = (currentStage + 1) % stages.length;
                if (currentStage === 0) breathCount++;
                
                // Update stats
                document.querySelector('.breath-count span').textContent = breathCount;
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                document.querySelector('.exercise-time span').textContent = 
                    `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
                
                if (this.isRunning) {
                    this.animationFrame = requestAnimationFrame(updateDisplay);
                }
            }, stage.duration * 1000);
        };
        
        this.animationFrame = requestAnimationFrame(updateDisplay);
    }

    showBreathingModal() {
        const modal = document.createElement('div');
        modal.className = 'breathing-modal';
        modal.innerHTML = `
            <div class="breathing-modal-content">
                <div class="modal-header">
                    <h3>Breathing Exercise</h3>
                    <button id="closeBreathing" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="breathingVisualization"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Re-initialize visualization
        this.createBreathingVisualization();
        this.setupEventListeners();
        
        // Add close functionality
        modal.querySelector('#closeBreathing').addEventListener('click', () => {
            this.stopBreathingExercise();
            modal.remove();
        });
    }

    stopBreathingExercise() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.breathingApp = new BreathingTechniques();
    window.breathingApp.init();
});