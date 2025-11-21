// camera.js - Webcam integration and emotion detection
class CameraManager {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.isActive = false;
    }

    async initialize() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('webcamCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        const toggleBtn = document.getElementById('toggleCamera');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleCamera());
        }

        console.log('Camera Manager initialized');
    }

    async toggleCamera() {
        if (this.isActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }

    async startCamera() {
        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });

            if (this.video) {
                this.video.srcObject = this.stream;
                this.isActive = true;

                // Update button
                const toggleBtn = document.getElementById('toggleCamera');
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera';
                    toggleBtn.classList.add('active');
                }

                // Update robot status
                const robotStatus = document.getElementById('robotStatus');
                if (robotStatus) {
                    robotStatus.textContent = 'Camera Active';
                }

                console.log('Camera started successfully');
                this.showNotification('Camera started', 'success');
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMessage = 'Could not access camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else {
                errorMessage += 'Please check your camera permissions.';
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
        }

        this.isActive = false;

        // Update button
        const toggleBtn = document.getElementById('toggleCamera');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
            toggleBtn.classList.remove('active');
        }

        // Update robot status
        const robotStatus = document.getElementById('robotStatus');
        if (robotStatus) {
            robotStatus.textContent = 'Online & Listening';
        }

        console.log('Camera stopped');
    }

    captureFrame() {
        if (!this.isActive || !this.video || !this.canvas || !this.ctx) {
            return null;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.ctx.drawImage(this.video, 0, 0);

        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.cameraManager = new CameraManager();
    window.cameraManager.initialize();
});
