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

    fillRoundRect(x, y, w, h, r, color) {
        this.ctx.beginPath();
        // The Canvas roundRect method handles the corner radius 'r'
        if (this.ctx.roundRect) {
            this.ctx.roundRect(x, y, w, h, r);
        } else {
            // Fallback for very old browsers (Next.js usually doesn't need this)
            this.ctx.rect(x, y, w, h);
        }

        this.ctx.fillStyle = this._colorToHex(color);
        this.ctx.fill();
    }

    // You might also want the outline version
    drawRoundRect(x, y, w, h, r, color) {
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(x, y, w, h, r);
        } else {
            this.ctx.rect(x, y, w, h);
        }

        this.ctx.strokeStyle = this._colorToHex(color);
        this.ctx.stroke();
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
    const [code, setCode] = useState(`

const bgColor = tft.color565(0,0,255);
const color = tft.color565(255,200,50);
const orange = tft.color565(255, 165, 0);

const _x = 5;
const _y = 5;
const _w = 50;
const _h = 50;

const pad = Math.min(_w, _h) * 0.05;
const availableW = _w - (pad * 2);
const availableH = _h - (pad * 2);

const cx = _x + (_w / 2);
const cy = _y + (_h / 2);
    
const scale = (Math.min(availableW, availableH)) / 100.0;

tft.drawRect(_x, _y, _w, _h, bgColor);


const houseW = (35 * scale);    // Half-width of the base
const houseH = (35 * scale);    // Height of the base
const roofH  = (45 * scale);

const doorW = (15 * scale);
const doorH = (25 * scale);


tft.fillTriangle(cx - (50 * scale), cy, cx + (50 * scale), cy, cx, cy - roofH, color);
tft.fillRect(cx - houseW, cy, houseW * 2, houseH, color);
tft.fillRect(cx - (doorW / 2), cy + houseH - doorH, doorW, doorH, bgColor);





tft.setTextColor(tft.color565(255,0,255)); // White
tft.setTextSize(2);
tft.drawCentreString("MENU", 160, 20);


tft.fillRoundRect(110, 100, 100, 40, 5, orange);
tft.setTextColor(0x0000); // Black text
tft.drawCentreString("START", 160, 112);





`);

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
        <div className="container-fluid py-4 bg-dark text-light">
            <div className="row justify-content-center">
                {/* <div className="col-12 text-center mb-4">
                    <h2 className="display-6 fw-bold border-bottom pb-2 d-inline-block">
                        TFT_eSPI <span className="text-info">Simulator</span>
                    </h2>
                </div> */}

                <div className="col-lg-8 mb-4">
                    <div className="card bg-black border-secondary shadow">
                        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                            <span className="font-monospace small">sketch.ino (JS Mode)</span>
                            <button
                                onClick={runCode}
                                className="btn btn-primary btn-sm px-4 fw-bold"
                            >
                                ▶ Run Code
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="form-control bg-black text-success border-0 font-monospace p-3"
                                style={{ height: '400px', resize: 'none', outline: 'none' }}
                                spellCheck="false"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 text-center">
                    <div className="sticky-top" style={{ top: '20px' }}>
                        <p className="text-secondary small mb-2 uppercase fw-bold">Output: 320x240 px</p>
                        <div
                            className="d-inline-block shadow-lg border border-4 border-secondary rounded"
                            style={{ lineHeight: 0 }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={320}
                                height={240}
                                className="bg-black rounded-1"
                            />
                        </div>
                        <div className="mt-3 text-start bg-secondary bg-opacity-10 p-3 rounded border border-secondary border-opacity-25">
                            <h6 className="text-info">Quick Reference:</h6>
                            <ul className="list-unstyled small mb-0 font-monospace">
                                <li>• tft.fillScreen(color)</li>
                                <li>• tft.color565(r, g, b)</li>
                                <li>• tft.fillRoundRect(x,y,w,h,r,color)</li>
                                <li>• tft.drawSmoothArc(...)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
