// Utility functions for Sensory Sketchpad

class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static getPointerPosition(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    static vibrate(pattern = [50]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
            return false;
        }
    }

    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    static announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    static createSparkleParticle(x, y, color) {
        return {
            x,
            y,
            vx: Utils.randomRange(-2, 2),
            vy: Utils.randomRange(-2, 2),
            life: 1.0,
            maxLife: Utils.randomRange(0.5, 1.0),
            size: Utils.randomRange(2, 6),
            color,
            rotation: 0,
            rotationSpeed: Utils.randomRange(-10, 10)
        };
    }

    static updateSparkleParticle(particle, deltaTime) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= deltaTime * 2;
        particle.rotation += particle.rotationSpeed;
        
        // Fade out
        particle.vy += 0.1; // gravity
        
        return particle.life > 0;
    }

    static drawSparkleParticle(ctx, particle) {
        ctx.save();
        
        const alpha = Math.max(0, particle.life / particle.maxLife);
        const size = particle.size * alpha;
        
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        
        // Draw sparkle as a 4-pointed star
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Add inner points
            const innerAngle = angle + Math.PI / 4;
            const innerX = Math.cos(innerAngle) * size * 0.4;
            const innerY = Math.sin(innerAngle) * size * 0.4;
            ctx.lineTo(innerX, innerY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Export for use in other modules
window.Utils = Utils;