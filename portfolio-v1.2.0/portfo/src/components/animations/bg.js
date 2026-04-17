import { useEffect, useRef } from "react";

export default function StarfieldBackground({ style, className }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;

        const stars = Array.from({ length: 180 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.4 + 0.2,
            speed: Math.random() * 0.00008 + 0.00002,
            angle: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.6 + 0.4,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.015 + 0.005,
        }));

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        }

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        function draw() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            // Fond dégradé violet sombre
            const bg = ctx.createRadialGradient(
                w * 0.5, h * 0.75, 0,
                w * 0.5, h * 0.5, Math.max(w, h) * 0.9
            );
            bg.addColorStop(0, "#1a0a2e");
            bg.addColorStop(0.45, "#0d0619");
            bg.addColorStop(1, "#050208");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Nébuleuse subtile
            const neb = ctx.createRadialGradient(w * 0.35, h * 0.6, 0, w * 0.35, h * 0.6, w * 0.5);
            neb.addColorStop(0, "rgba(80,20,100,0.18)");
            neb.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = neb;
            ctx.fillRect(0, 0, w, h);

            for (const s of stars) {
                s.x += Math.cos(s.angle) * s.speed;
                s.y += Math.sin(s.angle) * s.speed;
                s.twinkle += s.twinkleSpeed;
                if (s.x < -0.02) s.x = 1.02;
                if (s.x > 1.02) s.x = -0.02;
                if (s.y < -0.02) s.y = 1.02;
                if (s.y > 1.02) s.y = -0.02;

                const flicker = s.alpha * (0.75 + 0.25 * Math.sin(s.twinkle));
                const sx = s.x * w;
                const sy = s.y * h;

                // Halo pour les grosses étoiles
                if (s.r > 1.0) {
                    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.5);
                    glow.addColorStop(0, `rgba(200,190,255,${flicker * 0.3})`);
                    glow.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(sx, sy, s.r * 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = flicker;
                ctx.fillStyle = s.r > 1.1 ? "#e8e0ff" : "#ffffff";
                ctx.beginPath();
                ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            animationId = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                display: "block",
                width: "100%",
                height: "100%",
                ...style,
            }}
        />
    );
}