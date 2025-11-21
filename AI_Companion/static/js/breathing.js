// breathing.js - Interactive breathing exercises
class BreathingTechniques {
    constructor() { // initialize variables
        this.currentExercise = null; // current breathing technique
        this.isRunning = false; // is the exercise running?
        this.animationFrame = null; // animation frame reference
    }

    init() { // initialize event listeners and visualization
        this.setupEventListeners(); // setup button listeners
        this.createBreathingVisualization(); // create visualization elements
    }

    setupEventListeners() {
        // Breathing exercise buttons
        document.querySelectorAll('.breathing-btn').forEach(btn => { // select all breathing buttons
            btn.addEventListener('click', (e) => { // on click
                const technique = e.target.dataset.technique; // get technique from data attribute
                this.startBreathingExercise(technique); // start the exercise
            });
        });

        // Close breathing modal
        document.getElementById('closeBreathing')?.addEventListener('click', () => {
            this.stopBreathingExercise();
        });
    }

    createBreathingVisualization() { // create the breathing visualization elements
        const container = document.getElementById('breathingVisualization'); // get container
        if (!container) return; // exit if not found

        container.innerHTML = `
            <div class="breathing-circle">
                <div class="circle-outer"></div>
                <div class="circle-inner"></div>
                <div class="breathing-text">
                    <div class="instruction">Ready to Begin</div>
                    <div class="timer">--</div>
                </div>
            </div>
            <div class="breathing-controls">
                <button class="btn" id="startBreathing">Start Exercise</button>
                <button class="btn-outline" id="pauseBreathing" style="display: none;">Pause</button>
            </div>
            <div class="breathing-stats">
                <div class="breath-count">Breaths: <span>0</span></div>
                <div class="exercise-time">Time: <span>00:00</span></div>
            </div>
        `;

        // Add start button listener
        const startBtn = document.getElementById('startBreathing');
        const pauseBtn = document.getElementById('pauseBreathing');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (!this.isRunning) {
                    this.isRunning = true;
                    startBtn.style.display = 'none';
                    if (pauseBtn) pauseBtn.style.display = 'inline-block';
                    this.beginExercise();
                }
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.isRunning = false;
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
            });
        }
    }

    startBreathingExercise(technique) { // start the selected breathing exercise
        this.currentExercise = technique; // set current technique
        this.isRunning = false; // wait for user to click start
        
        // Show breathing modal
        this.showBreathingModal();
    }

    beginExercise() { // actually start the exercise animation
        // Start animation based on technique
        switch(this.currentExercise) {
            case '478': // 4-7-8 breathing technique
                this.start478Breathing();
                break;
            case 'box': // Box breathing technique
                this.startBoxBreathing();
                break;
            case 'coherent':
                this.startCoherentBreathing();
                break;
        }
    }

    start478Breathing() { // 4-7-8 breathing technique
        const stages = [
            { text: 'Breathe In Through Nose', duration: 4, action: 'expand' }, // inhale
            { text: 'Hold Breath', duration: 7, action: 'hold' }, // hold breath
            { text: 'Exhale Through Mouth', duration: 8, action: 'contract' } // exhale
        ];
        
        this.runBreathingCycle(stages, '4-7-8 Breathing'); // start the cycle
    }

    startBoxBreathing() { // box breathing technique
        const stages = [
            { text: 'Breathe In', duration: 4, action: 'expand' }, // inhale
            { text: 'Hold Breath', duration: 4, action: 'hold' }, // hold breath
            { text: 'Exhale Slowly', duration: 4, action: 'contract' }, // exhale
            { text: 'Hold Empty', duration: 4, action: 'hold' } // hold breath
        ];
        
        this.runBreathingCycle(stages, 'Box Breathing'); // start the cycle
    }

    startCoherentBreathing() { // coherent breathing technique
        const stages = [
            { text: 'Breathe In', duration: 5, action: 'expand' }, // inhale
            { text: 'Exhale Slowly', duration: 5, action: 'contract' } // exhale
        ];
        
        this.runBreathingCycle(stages, 'Coherent Breathing'); // start the cycle
    }

    runBreathingCycle(stages, exerciseName) { 
        let currentStage = 0;
        let breathCount = 0;
        let startTime = Date.now();
        let countdown = stages[0].duration;
         
        const updateDisplay = () => {
            if (!this.isRunning) return;
            
            const stage = stages[currentStage];
            const circle = document.querySelector('.breathing-circle');
            const instruction = document.querySelector('.instruction');
            const timer = document.querySelector('.timer');
            
            if (!circle || !instruction || !timer) return;
            
            // Update text and start countdown
            instruction.textContent = stage.text;
            countdown = stage.duration;
            
            // Animate circle
            circle.className = `breathing-circle ${stage.action}`;
            
            // Countdown timer
            const countdownInterval = setInterval(() => {
                if (!this.isRunning) {
                    clearInterval(countdownInterval);
                    return;
                }
                
                countdown--;
                if (timer) timer.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
            
            // Move to next stage after duration
            setTimeout(() => {
                if (!this.isRunning) return;
                
                currentStage = (currentStage + 1) % stages.length;
                if (currentStage === 0) breathCount++;
                
                // Update stats
                const breathCountEl = document.querySelector('.breath-count span');
                const timeEl = document.querySelector('.exercise-time span');
                if (breathCountEl) breathCountEl.textContent = breathCount;
                
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                if (timeEl) {
                    timeEl.textContent = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
                }
                
                if (this.isRunning) {
                    updateDisplay();
                }
            }, stage.duration * 1000);
        };
        
        updateDisplay();
    }

    showBreathingModal() {// display the breathing exercise
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
        
        document.body.appendChild(modal); // add to body
        
        // Re-initialize visualization
        this.createBreathingVisualization();
        this.setupEventListeners();
        
        // Add close functionality
        modal.querySelector('#closeBreathing').addEventListener('click', () => {
            this.stopBreathingExercise();
            modal.remove();
        });
    }

    stopBreathingExercise() { // stop the breathing exercise
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