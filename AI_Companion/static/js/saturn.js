// saturn.js - Animated Saturn background
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    createMoons();
    animateSaturnRings();
});

function createStars() {
    const container = document.querySelector('.stars');
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3;
        const brightness = Math.random() * 0.8 + 0.2;
        
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${brightness};
            animation: twinkle ${Math.random() * 5 + 3}s infinite alternate;
        `;
        
        container.appendChild(star);
    }
}

function createMoons() {
    const container = document.querySelector('.login-container');
    const moonCount = 5;
    
    for (let i = 0; i < moonCount; i++) {
        const moon = document.createElement('div');
        moon.className = 'moon';
        
        const size = Math.random() * 15 + 10;
        const duration = Math.random() * 20 + 20;
        
        moon.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 10}s;
        `;
        
        container.appendChild(moon);
    }
}

function animateSaturnRings() {
    const saturn = document.querySelector('.saturn-planet');
    if (!saturn) return;
    
    let angle = 0;
    setInterval(() => {
        angle += 0.2;
        const rings = saturn.querySelectorAll('::before, ::after');
        // Note: We can't directly animate pseudo-elements, but the CSS animation handles this
    }, 50);
}

// Add CSS for twinkling stars
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.2; transform: scale(1); }
    }
`;
document.head.appendChild(style);