"use client";
import React, { useEffect, useRef, useState } from "react";
import { defaultCode } from './defaultCode'

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
        this._textSize = 1;
        this.SEG_MAP = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F];
    }

    _getFontHeight(font) {
        const heights = { 1: 8, 2: 16, 4: 32, 6: 48, 7: 48, 8: 75 };
        return heights[font] || 8;
    }

    _draw7Seg(x, y, char, size, color) {
        const mask = this.SEG_MAP[parseInt(char)] || (char === ':' ? 0x80 : 0);
        const w = 10 * size;
        const h = 18 * size;
        const t = 2 * size;

        // Internal helper function (allowed inside a method)
        const drawS = (sx, sy, sw, sh) => this.fillRect(sx, sy, sw, sh, color);

        if (mask & 0x01) drawS(x + t, y, w - 2 * t, t);       // A
        if (mask & 0x02) drawS(x + w - t, y + t, t, h / 2 - t); // B
        if (mask & 0x04) drawS(x + w - t, y + h / 2, t, h / 2 - t); // C
        if (mask & 0x08) drawS(x + t, y + h - t, w - 2 * t, t); // D
        if (mask & 0x10) drawS(x, y + h / 2, t, h / 2 - t);    // E
        if (mask & 0x20) drawS(x, y + t, t, h / 2 - t);       // F
        if (mask & 0x40) drawS(x + t, y + h / 2 - t / 2, w - 2 * t, t); // G

        if (mask & 0x80) { // Colon
            drawS(x + w / 2 - t / 2, y + h / 4, t, t);
            drawS(x + w / 2 - t / 2, y + 3 * h / 4, t, t);
        }
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

    drawString(string, x, y, font) {
        const text = string.toString();
        const fNum = font || this._currentFont || 1;
        const size = this._textSize || 1;
        const baseHeight = this._getFontHeight(fNum);
        const finalHeight = baseHeight * size;

        if (fNum === 7) {
            // Font 7: Seven-Segment Logic
            let curX = x;
            for (let char of text) {
                this._draw7Seg(curX, y, char, size, this._textColor);
                curX += (14 * size); // Standard spacing for Font 7
            }
        } else {
            // Standard Fonts
            this.ctx.fillStyle = this._textColor;
            // Using monospace to mimic the fixed-width nature of many TFT fonts
            this.ctx.font = `${finalHeight}px monospace`;
            // Offset Y by 85% of height because Canvas draws from bottom baseline
            this.ctx.fillText(text, x, y + (finalHeight * 0.85));
        }
    }

    drawCenterString(string, dX, dY, font) {
        const text = string.toString();
        const fNum = font || this._currentFont || 1;
        const size = this._textSize || 1;
        let textWidth = 0;

        if (fNum === 7) {
            // Fixed width calculation for 7-segment
            textWidth = text.length * (14 * size);
        } else {
            // Dynamic width calculation for standard fonts
            const baseHeight = this._getFontHeight(fNum);
            this.ctx.font = `${baseHeight * size}px monospace`;
            textWidth = this.ctx.measureText(text).width;
        }

        const x = dX - (textWidth / 2);
        this.drawString(text, x, dY, fNum);
    }

    // Alias for British spelling support
    drawCentreString(string, dX, dY, font) {
        this.drawCenterString(string, dX, dY, font);
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
    // const [code, setCode] = useState('');
    const isLoaded = useRef(false);
    const [inoPreview, setInoPreview] = useState("");

    const [code, setCode] = useState(() => {
        // Check if we are in the browser (client-side)
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("tft_code_draft");
            // Return saved code if it exists and isn't just whitespace
            if (saved && saved.trim() !== "") {
                return saved;
            }
        }
        return defaultCode;
    });



    useEffect(() => {
        // Dynamic import inside useEffect ensures window/document exist
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
        runCode()
    }, []);

    useEffect(() => {
        const saved = sessionStorage.getItem("tft_code_draft");
        if (saved && saved.trim() !== "") {
            setCode(saved);
        } else {
            // setCode(defaultCode);
        }
        isLoaded.current = true; // Mark as ready for saving
    }, []);

    // 2. Auto-Save (Runs when code changes)
    useEffect(() => {
        // ONLY save if the initial load has already happened
        if (isLoaded.current) {
            sessionStorage.setItem("tft_code_draft", code);
        }
        runCode()
    }, [code]);

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

    const generateInoCode = () => {
        let inoBody = code;

        // 1. Convert Math functions
        inoBody = inoBody.replace(/Math\.min/g, 'min');
        inoBody = inoBody.replace(/Math\.max/g, 'max');
        inoBody = inoBody.replace(/Math\.abs/g, 'abs');

        // 2. Convert variables to C++ types
        // This rule finds 'const/let name = ...' and decides if it's an int or float
        inoBody = inoBody.split('\n').map(line => {
            if (!line.trim()) return line;

            const varMatch = line.match(/(const|let|var)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                const name = varMatch[2];
                const value = varMatch[3];

                let type = "int"; // Default

                // 1. Color Type (Must be uint16_t)
                if (value.includes('color565') || value.includes('0x')) {
                    type = "uint16_t";
                }
                // 2. Float Type (Decimals or division)
                else if (value.includes('.') || value.includes('/') || value.includes('min') || name.includes('scale')) {
                    type = "float";
                }

                // Reconstruct: e.g., "uint16_t bgColor = tft.color565(0,0,255);"
                return `  ${type} ${name} = ${value};`;
            }
            return '  ' + line;
        }).join('\n');

        // 3. Final Template
        return `
#include <SPI.h>
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

void setup() {
  tft.init();
  tft.setRotation(1); 
  tft.fillScreen(TFT_BLACK);

  // --- Converted Code ---
${inoBody.split('\n').map(line => '  ' + line).join('\n')}
  // --- End of Converted Code ---
}

void loop() {}
`.trim();
    };


    return (
        <>
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
                                <div>
                                    <button
                                        className="btn btn-warning btn-sm fw-bold shadow-sm me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#inoExportModal"
                                        onClick={() => setInoPreview(generateInoCode())}
                                    >
                                        Generate .ino
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#methodsModal"
                                    >
                                        📋 Library Methods
                                    </button>

                                    <button
                                        onClick={runCode}
                                        className="btn btn-primary btn-sm px-4 fw-bold"
                                    >
                                        ▶ Run Code
                                    </button>
                                </div>
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


            <div className="modal fade" id="methodsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen modal-lg modal-dialog-scrollable">
                    <div className="modal-content bg-dark text-white border-secondary">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-info">TFT_eSPI Simulator Methods</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <table className="table table-dark table-hover small font-monospace">
                                <thead>
                                    <tr className="text-secondary">
                                        <th>Method Signature</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>tft.init() / tft.begin()</td><td>Reset screen to black</td></tr>
                                    <tr><td>tft.fillScreen(color)</td><td>Fill entire 320x240 area</td></tr>
                                    <tr><td>tft.color565(r, g, b)</td><td>Convert 0-255 RGB to 16-bit hex</td></tr>
                                    <tr><td>tft.drawPixel(x, y, color)</td><td>Draw single point</td></tr>
                                    <tr><td>tft.drawLine(x0, y0, x1, y1, color)</td><td>Draw line between points</td></tr>
                                    <tr><td>tft.drawRect / tft.fillRect(x, y, w, h, color)</td><td>Standard rectangles</td></tr>
                                    <tr><td>tft.drawRoundRect / tft.fillRoundRect(x, y, w, h, r, color)</td><td>Rounded rectangles</td></tr>
                                    <tr><td>tft.drawCircle / tft.fillCircle(x, y, r, color)</td><td>Draw circles</td></tr>
                                    <tr><td>tft.drawTriangle / tft.fillTriangle(x0,y0,x1,y1,x2,y2,color)</td><td>Draw triangles</td></tr>
                                    <tr><td>tft.drawSmoothArc(cx, cy, or, ir, start, end, color, bg)</td><td>AA Arcs (0=6 o&apos;clock)</td></tr>
                                    <tr><td>tft.setTextColor(color, bg)</td><td>Set global text color</td></tr>
                                    <tr><td>tft.setTextSize(1-7)</td><td>Set global font multiplier</td></tr>
                                    <tr><td>tft.drawString(text, x, y, font)</td><td>Standard text (Font 7 = 7seg)</td></tr>
                                    <tr><td>tft.drawCenterString(text, dX, dY, font)</td><td>Horizontal centered text</td></tr>
                                    <tr><td>tft.print / tft.println(text)</td><td>Serial-style printing</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer border-secondary text-secondary small">
                            Note: Use JS syntax (const/let) instead of C++ types (int/float).
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="inoExportModal" tabIndex="-1">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content bg-black text-white border-0 rounded-0">
                        <div className="modal-header border-secondary py-2">
                            <h5 className="modal-title text-warning font-monospace">Generated Arduino Sketch (.ino)</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-0">
                            <pre className="p-4 m-0 text-success font-monospace" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                <code>{inoPreview}</code>
                            </pre>
                        </div>
                        <div className="modal-footer border-secondary">
                            {/* <button className="btn btn-success px-4" onClick={() => downloadIno(inoPreview)}>
                                ⬇️ Download File
                            </button> */}
                            <button className="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}


