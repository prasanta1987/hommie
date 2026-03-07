"use client";
import React, { useEffect, useRef, useState } from "react";

// --- TFT_eSPI Library Simulation Class ---
class TFTSimulator {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = 320;
        this.height = 240;
        this._cursorX = 0;
        this._cursorY = 0;
        this._textColor = "#FFFFFF";
        this._textSize = 1;
        this._bgColor = "#000000";
    }

    color565(r, g, b) {
        return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
    }

    // Convert 16-bit RGB565 to Hex string
    _colorToHex(color) {
        if (typeof color === "string") return color;
        const r = ((color >> 11) & 0x1F) << 3;
        const g = ((color >> 5) & 0x3F) << 2;
        const b = (color & 0x1F) << 3;
        return `rgb(${r},${g},${b})`;
    }

    // --- Core Methods ---
    init() { this.fillScreen(0x0000); }
    begin() { this.init(); }
    setRotation(r) { /* Simulation fixed at 320x240 */ }

    // --- Drawing Shapes ---
    fillScreen(color) {
        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.fillRect(x, y, 1, 1);
    }

    drawLine(x0, y0, x1, y1, color) {
        this.ctx.strokeStyle = this._colorToHex(color);
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }

    drawSmoothArc(cx, cy, outerRadius, innerRadius, startAngle, endAngle, color, bgColor, roundEnds = false) {
        const ctx = this.ctx;

        // Convert TFT_eSPI angles (0 deg = 6 o'clock) to Canvas radians (0 rad = 3 o'clock)
        const toRad = (angle) => (angle + 90) * (Math.PI / 180);
        const sRad = toRad(startAngle);
        const eRad = toRad(endAngle);

        ctx.beginPath();
        // Draw the outer arc
        ctx.arc(cx, cy, outerRadius, sRad, eRad, false);

        // Draw the inner arc in reverse to create the "thickness"
        ctx.arc(cx, cy, innerRadius, eRad, sRad, true);

        ctx.closePath();

        // Apply the colors
        ctx.fillStyle = this._colorToHex(color);

        // TFT_eSPI "smooth" graphics are natively handled by Canvas anti-aliasing.
        // We fill the path to represent the arc thickness.
        ctx.fill();

        // If rounded ends are requested, we draw circles at the tips
        if (roundEnds) {
            const thickness = outerRadius - innerRadius;
            const midRadius = innerRadius + (thickness / 2);
            this.fillCircle(cx + midRadius * Math.cos(sRad), cy + midRadius * Math.sin(sRad), thickness / 2, color);
            this.fillCircle(cx + midRadius * Math.cos(eRad), cy + midRadius * Math.sin(eRad), thickness / 2, color);
        }
    }


    drawFastVLine(x, y, h, color) { this.fillRect(x, y, 1, h, color); }
    drawFastHLine(x, y, w, color) { this.fillRect(x, y, w, 1, color); }

    drawRect(x, y, w, h, color) {
        this.ctx.strokeStyle = this._colorToHex(color);
        this.ctx.strokeRect(x, y, w, h);
    }

    fillRect(x, y, w, h, color) {
        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.fillRect(x, y, w, h);
    }

    drawCircle(x, y, r, color) {
        this.ctx.strokeStyle = this._colorToHex(color);
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    fillCircle(x, y, r, color) {
        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTriangle(x0, y0, x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = this._colorToHex(color);
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    fillTriangle(x0, y0, x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.closePath(); // Automatically draws the line back to x0, y0

        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.fill(); // Fills the defined path
    }



    // --- Text Methods ---
    setCursor(x, y) { this._cursorX = x; this._cursorY = y; }
    setTextColor(color, bg) {
        this._textColor = this._colorToHex(color);
        if (bg !== undefined) this._bgColor = this._colorToHex(bg);
    }
    setTextSize(size) { this._textSize = size; }

    drawCentreString(string, dX, dY, font) {
        const text = string.toString();
        // Set the font size based on the current _textSize or a passed font index
        const fontSize = (font || this._textSize) * 12;
        this.ctx.font = `${fontSize}px monospace`;

        // Calculate text width to find the center offset
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;

        // Calculate the starting X so that the middle of the text is at dX
        const x = dX - (textWidth / 2);

        this.ctx.fillStyle = this._textColor;
        // Offset Y by font size because Canvas draws from the baseline
        this.ctx.fillText(text, x, dY + (fontSize * 0.8));
    }

    drawString(string, x, y) {
        this.ctx.fillStyle = this._textColor;
        this.ctx.font = `${this._textSize * 12}px monospace`;
        this.ctx.fillText(string, x, y + (this._textSize * 10));
    }

    print(text) {
        this.drawString(text.toString(), this._cursorX, this._cursorY);
        this._cursorX += this.ctx.measureText(text).width;
    }

    println(text) {
        this.print(text);
        this._cursorX = 0;
        this._cursorY += (this._textSize * 14);
    }
}

export default function TFTSimulatorPage() {
    const canvasRef = useRef(null);
    const [code, setCode] = useState(`tft.fillScreen(0x0000);
tft.setCursor(20, 30);
tft.setTextColor(0xFFFF); // White
tft.setTextSize(2);
tft.println("TFT_eSPI Demo");

tft.drawRect(20, 60, 100, 50, 0xF800); // Red Rect
tft.fillCircle(200, 100, 30, 0x07E0); // Green Circle
tft.drawTriangle(160, 200, 200, 150, 240, 200, 0x001F); // Blue Triangle`);

    const runCode = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const tft = new TFTSimulator(ctx);

        try {
            // Clear previous canvas state before running new code
            ctx.clearRect(0, 0, 320, 240);
            const execute = new Function("tft", code);
            execute(tft);
        } catch (err) {
            console.error("Execution Error:", err);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
            <h2>TFT_eSPI 320x240 Simulator (JS)</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        style={{ width: '100%', height: '300px', backgroundColor: '#000', color: '#0f0', padding: '10px', fontFamily: 'monospace' }}
                    />
                    <button onClick={runCode} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>
                        Run Simulation
                    </button>
                </div>
                <div style={{ border: '5px solid #333' }}>
                    <canvas ref={canvasRef} width={320} height={240} style={{ backgroundColor: '#000' }} />
                </div>
            </div>
        </div>
    );
}
