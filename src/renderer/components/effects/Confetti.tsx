import { useEffect, useRef } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#f05033', '#4cc38a', '#5aa9ff', '#e8c46a', '#b48cff', '#ff8fab', '#ffd166'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 紙の向き（くるくる回って裏返る＝立体的に見せる） */
  spin: number;
  spinSpeed: number;
  flip: number;
  flipSpeed: number;
  w: number;
  h: number;
  color: string;
  shape: 'rect' | 'circle' | 'ribbon';
}

const GRAVITY = 0.32;
const DRAG = 0.985;

/** 画面の左右下からクラッカーのように打ち上げる紙吹雪（表示している間だけ） */
export function Confetti({ count = 160 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const make = (fromLeft: boolean, i: number): Piece => {
      // 左下・右下から画面の中央上へ向けて扇状に飛ばす
      const angle = (fromLeft ? -60 : -120) + (Math.random() - 0.5) * 40;
      const speed = 14 + Math.random() * 14;
      const rad = (angle * Math.PI) / 180;
      const shape = i % 5 === 0 ? 'circle' : i % 4 === 0 ? 'ribbon' : 'rect';
      return {
        x: fromLeft ? -10 : W + 10,
        y: H + 10,
        vx: Math.cos(rad) * speed,
        vy: Math.sin(rad) * speed * (H / 900 + 0.6),
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.08 + Math.random() * 0.15,
        w: shape === 'ribbon' ? 5 : 8 + Math.random() * 6,
        h: shape === 'ribbon' ? 18 + Math.random() * 10 : 10 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        shape,
      };
    };

    const pieces: Piece[] = [];
    // 2回に分けて打ち上げると、より派手に見える
    const burst = (n: number) => {
      for (let i = 0; i < n; i++) pieces.push(make(i % 2 === 0, i));
    };
    burst(Math.round(count * 0.6));
    const second = setTimeout(() => burst(Math.round(count * 0.4)), 350);

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pieces) {
        p.vx *= DRAG;
        p.vy = p.vy * DRAG + GRAVITY;
        // 落ちてくるときは空気抵抗でひらひら揺れる
        if (p.vy > 0) p.vx += Math.sin(p.flip) * 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinSpeed;
        p.flip += p.flipSpeed;
        if (p.y > H + 40) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        // 裏返る途中は細く・暗く描いて、紙が回転しているように見せる
        const face = Math.cos(p.flip);
        ctx.scale(1, Math.max(0.08, Math.abs(face)));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = face > 0 ? 1 : 0.7;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (pieces.some((p) => p.y <= H + 40)) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      clearTimeout(second);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={styles.layer} aria-hidden />;
}
