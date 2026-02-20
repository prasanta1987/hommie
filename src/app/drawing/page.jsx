'use client';

import React, { useRef, useState, useEffect } from 'react';

// --- HELPER FUNCTIONS (Defined outside to avoid ReferenceErrors) ---
const hexTo565 = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
  return `0x${rgb565.toString(16).toUpperCase().padStart(4, '0')}`;
};

export default function Esp32FaceDesigner() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#FF00FF');
  const [isFilled, setIsFilled] = useState(false);
  const [actions, setActions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isAngling, setIsAngling] = useState(null); 
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  // Update selected shape's color instantly
  useEffect(() => {
    if (selectedIdx !== -1) {
      setActions(prev => prev.map((a, i) => i === selectedIdx ? { ...a, color } : a));
    }
  }, [color]);

  // --- THE MASTER RENDER LOOP ---
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, 320, 240);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 320, 240);

      const drawShape = (a, isSelected = false) => {
        ctx.beginPath();
        ctx.strokeStyle = a.color;
        ctx.fillStyle = a.color;
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.globalAlpha = 1.0;

        if (a.type === 'rect') {
          a.filled ? ctx.fillRect(a.x, a.y, a.w, a.h) : ctx.strokeRect(a.x, a.y, a.w, a.h);
        } else if (a.type === 'circle') {
          ctx.arc(a.cx, a.cy, a.r, 0, Math.PI * 2);
          a.filled ? ctx.fill() : ctx.stroke();
        } else if (a.type === 'line') {
          ctx.moveTo(a.x1, a.y1); ctx.lineTo(a.x2, a.y2); ctx.stroke();
        } else if (a.type === 'arc') {
          ctx.arc(a.cx, a.cy, a.r, a.startAngle || 0, a.endAngle || Math.PI, false);
          ctx.stroke(); 
        } else if (a.type === 'pencil' && a.points?.length > 1) {
          ctx.moveTo(a.points[0].x, a.points[0].y);
          a.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }

        if (isSelected && a.type !== 'pencil') {
          ctx.fillStyle = "red";
          let hX = a.type === 'arc' ? a.cx : (a.type === 'rect' ? a.x + a.w : a.cx + a.r);
          let hY = a.type === 'arc' ? a.cy - a.r : (a.type === 'rect' ? a.y + a.h : a.cy);
          ctx.fillRect(hX - 6, hY - 6, 12, 12);

          if (a.type === 'arc') {
            ctx.fillStyle = "#00FF00";
            const sX = a.cx + Math.cos(a.startAngle || 0) * a.r;
            const sY = a.cy + Math.sin(a.startAngle || 0) * a.r;
            const eX = a.cx + Math.cos(a.endAngle || Math.PI) * a.r;
            const eY = a.cy + Math.sin(a.endAngle || Math.PI) * a.r;
            ctx.fillRect(sX - 6, sY - 6, 12, 12);
            ctx.fillRect(eX - 6, eY - 6, 12, 12);
          }
        }
      };

      actions.forEach((a, idx) => drawShape(a, idx === selectedIdx));

      if (isDragging && tool !== 'select' && tool !== 'pencil') {
        const preview = { 
            type: tool, color, filled: isFilled, 
            cx: startPos.x, cy: startPos.y, r: Math.sqrt((currentPos.x - startPos.x)**2 + (currentPos.y - startPos.y)**2),
            startAngle: 0, endAngle: Math.PI,
            x: Math.min(startPos.x, currentPos.x), y: Math.min(startPos.y, currentPos.y),
            w: Math.abs(currentPos.x - startPos.x), h: Math.abs(currentPos.y - startPos.y),
            x1: startPos.x, y1: startPos.y, x2: currentPos.x, y2: currentPos.y
        };
        ctx.globalAlpha = 0.4; drawShape(preview);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [actions, isDragging, currentPos, selectedIdx, tool, color, isFilled]);

  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const p = getXY(e);
    setStartPos(p); setCurrentPos(p); setIsDragging(true);

    if (tool === 'select' && selectedIdx !== -1) {
      const a = actions[selectedIdx];
      if (a.type === 'arc') {
        const sX = a.cx + Math.cos(a.startAngle || 0) * a.r;
        const sY = a.cy + Math.sin(a.startAngle || 0) * a.r;
        const eX = a.cx + Math.cos(a.endAngle || Math.PI) * a.r;
        const eY = a.cy + Math.sin(a.endAngle || Math.PI) * a.r;
        if (Math.abs(p.x - sX) < 15 && Math.abs(p.y - sY) < 15) { setIsAngling('start'); return; }
        if (Math.abs(p.x - eX) < 15 && Math.abs(p.y - eY) < 15) { setIsAngling('end'); return; }
      }
      let hX = a.type === 'arc' ? a.cx : (a.type === 'rect' ? a.x + a.w : a.cx + a.r);
      let hY = a.type === 'arc' ? a.cy - a.r : (a.type === 'rect' ? a.y + a.h : a.cy);
      if (Math.abs(p.x - hX) < 15 && Math.abs(p.y - hY) < 15) { setIsResizing(true); return; }
    }

    if (tool === 'select') {
      const idx = actions.findLastIndex(a => p.x >= (a.x||a.cx-a.r||0)-15 && p.x <= (a.x+a.w||a.cx+a.r||0)+15);
      setSelectedIdx(idx);
    } else if (tool === 'pencil') {
      setActions([...actions, { type: 'pencil', points: [p], color }]);
    }
  };

  const handleMouseMove = (e) => {
    const p = getXY(e);
    if (!isDragging) return;
    const newActions = [...actions];
    if (tool === 'select' && selectedIdx !== -1) {
      const a = newActions[selectedIdx];
      if (isAngling) {
        const angle = Math.atan2(p.y - a.cy, p.x - a.cx);
        if (isAngling === 'start') a.startAngle = angle; else a.endAngle = angle;
      } else if (isResizing) {
        if (a.type === 'rect') { a.w = p.x - a.x; a.h = p.y - a.y; }
        else if (a.type === 'circle' || a.type === 'arc') { a.r = Math.sqrt((p.x-a.cx)**2 + (p.y-a.cy)**2); }
        else if (a.type === 'line') { a.x2 = p.x; a.y2 = p.y; }
      } else {
        const dx = p.x - currentPos.x, dy = p.y - currentPos.y;
        if (a.type === 'rect') { a.x += dx; a.y += dy; }
        else if (a.type === 'circle' || a.type === 'arc') { a.cx += dx; a.cy += dy; }
        else if (a.type === 'line') { a.x1 += dx; a.y1 += dy; a.x2 += dx; a.y2 += dy; }
      }
      setActions(newActions);
    } else if (tool === 'pencil') {
      newActions[newActions.length - 1].points.push(p);
      setActions(newActions);
    }
    setCurrentPos(p);
  };

  const handleMouseUp = () => {
    if (isDragging && tool !== 'pencil' && tool !== 'select' && !isResizing && !isAngling) {
      const shape = {
        type: tool, color, filled: isFilled,
        cx: startPos.x, cy: startPos.y, r: Math.sqrt((currentPos.x - startPos.x)**2 + (currentPos.y - startPos.y)**2),
        startAngle: 0, endAngle: Math.PI,
        x1: startPos.x, y1: startPos.y, x2: currentPos.x, y2: currentPos.y,
        x: Math.min(startPos.x, currentPos.x), y: Math.min(startPos.y, currentPos.y),
        w: Math.abs(currentPos.x - startPos.x), h: Math.abs(currentPos.y - startPos.y)
      };
      setActions([...actions, shape]);
    }
    setIsDragging(false); setIsResizing(false); setIsAngling(null);
  };

  const generateCpp = () => {
    let code = "void drawMyArt() {\n  tft.fillScreen(TFT_BLACK);\n";
    actions.forEach(a => {
      const c = hexTo565(a.color);
      if (a.type === 'rect') code += `  tft.${a.filled ? 'fillRect' : 'drawRect'}(${Math.round(a.x)}, ${Math.round(a.y)}, ${Math.round(a.w)}, ${Math.round(a.h)}, ${c});\n`;
      else if (a.type === 'circle') code += `  tft.${a.filled ? 'fillCircle' : 'drawCircle'}(${Math.round(a.cx)}, ${Math.round(a.cy)}, ${Math.round(a.r)}, ${c});\n`;
      else if (a.type === 'line') code += `  tft.drawLine(${Math.round(a.x1)}, ${Math.round(a.y1)}, ${Math.round(a.x2)}, ${Math.round(a.y2)}, ${c});\n`;
      else if (a.type === 'arc') {
        const s = Math.round((a.startAngle || 0) * 180 / Math.PI + 90) % 360;
        const e = Math.round((a.endAngle || Math.PI) * 180 / Math.PI + 90) % 360;
        code += `  tft.drawArc(${Math.round(a.cx)}, ${Math.round(a.cy)}, ${Math.round(a.r)}, ${Math.round(a.r)+2}, ${s}, ${e}, ${c});\n`;
      }
      else if (a.type === 'pencil') a.points.forEach((p, i) => i > 0 && (code += `  tft.drawLine(${Math.round(a.points[i-1].x)}, ${Math.round(a.points[i-1].y)}, ${Math.round(p.x)}, ${Math.round(p.y)}, ${c});\n`));
    });
    return code + "}";
  };

  return (
    <div className="container py-4">
      <div className="card shadow border-primary">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="mb-0">ESP32 Designer (Dual-Leg Arc)</h5>
          <div className="btn-group btn-group-sm my-1">
            {['pencil', 'line', 'rect', 'circle', 'arc', 'select'].map(t => (
              <button key={t} onClick={() => {setTool(t); setSelectedIdx(-1);}} className={`btn btn-light ${tool === t ? 'active fw-bold' : ''}`}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="card-body bg-light text-center">
          <div className="d-flex justify-content-center gap-3 mb-3 align-items-center">
            <input type="color" className="form-control form-control-color" value={color} onChange={(e) => setColor(e.target.value)} />
            <div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={isFilled} onChange={() => setIsFilled(!isFilled)} /><label className="form-check-label small">Fill</label></div>
            <button className="btn btn-warning btn-sm" onClick={() => { setActions(actions.filter((_, i) => i !== selectedIdx)); setSelectedIdx(-1); }}>Delete</button>
            <button className="btn btn-danger btn-sm" onClick={() => setActions([])}>Reset All</button>
          </div>
          <canvas ref={canvasRef} width={320} height={240} className="bg-white border rounded shadow-sm mx-auto d-block" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => setIsDragging(false)} style={{ cursor: tool === 'select' ? 'pointer' : 'crosshair' }} />
        </div>
      </div>
      <textarea readOnly className="form-control mt-3 bg-dark text-info font-monospace p-3 small" rows="6" value={generateCpp()} />
    </div>
  );
}
