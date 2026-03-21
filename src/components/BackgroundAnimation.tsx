import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3; // Very slow movement
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)'; // Neon cyan
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      // Adjust density based on screen size (minimalistic)
      const numParticles = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 1 - distance / 120;
            ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[var(--bg-primary)] overflow-hidden pointer-events-none transition-colors duration-300">
      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--text-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Neon Cyan Orb */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[var(--neon-cyan)] opacity-[0.04] dark:opacity-[0.08] blur-[120px]"
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-10%', '5%', '-10%'],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ top: '-10%', left: '-10%' }}
      />

      {/* Neon Magenta Orb */}
      <motion.div
        className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[var(--neon-magenta)] opacity-[0.04] dark:opacity-[0.08] blur-[120px]"
        animate={{
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-10%', '5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ bottom: '-10%', right: '-10%' }}
      />

      {/* Neon Lime/Accent Orb */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--neon-lime,theme(colors.emerald.500))] opacity-[0.03] dark:opacity-[0.05] blur-[100px]"
        animate={{
          x: ['0%', '-15%', '0%'],
          y: ['0%', '15%', '0%'],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ top: '30%', left: '30%' }}
      />
    </div>
  );
}
