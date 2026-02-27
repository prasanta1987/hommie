"use client";
import { useState } from "react";

export default function TftColorApp() {
  const [color, setColor] = useState("#24696b");

  // Helper to get RGB individual channels
  const getRGB = (hex) => {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  };

  // TFT_eSPI (RGB565) Conversion
  const getTFT = (hex) => {
    const { r, g, b } = getRGB(hex);
    const val = ((r & 0xf8) << 8) | ((g & 0xfc) << 3) | (b >> 3);
    return `0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
  };

  const { r, g, b } = getRGB(color);

  return (
    <main
      className="container-fluid d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: color, 
        transition: "background-color 0.4s ease-out" 
      }}
    >
      <div 
        className="card shadow-lg align-items-center p-4 text-center border-0 bg-dark text-white bg-opacity-75"
        style={{ borderRadius: "2rem", minWidth: "350px", backdropFilter: "blur(8px)" }}
      >
        <h4 className="fw-bold mb-2">Color Converter</h4>

        {/* Color Picker Input */}
        <input
          type="color"
          className="form-control form-control-color w-100 border-0 mb-2 shadow-sm"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ height: "80px", borderRadius: "1rem" }}
        />

        <div className="w-100 list-group list-group-flush bg-transparent">
          {/* HEX SECTION */}
          <div className="list-group-item bg-transparent text-white border-secondary">
            <small className="text-secondary d-block">HEX CODE</small>
            <span className="h4 font-monospace">{color.toUpperCase()}</span>
          </div>

          {/* RGB SECTION */}
          <div className="list-group-item bg-transparent text-white border-secondary">
            <small className="text-secondary d-block">RGB VALUES</small>
            <span className="h4 font-monospace text-info">
              {r}, {g}, {b}
            </span>
          </div>

          {/* TFT_eSPI SECTION */}
          <div className="list-group-item bg-transparent text-white border-0 mt-2">
            <div className="bg-warning bg-opacity-10 p-3 rounded-4 border border-warning">
              <small className="text-warning d-block fw-bold">TFT_eSPI (RGB565)</small>
              <span className="display-5 font-monospace fw-bold text-warning">
                {getTFT(color)}
              </span>
            </div>
          </div>
        </div>

        <button 
          className="btn w-50 btn-outline-light btn-sm mt-2 rounded-pill"
          onClick={() => navigator.clipboard.writeText(getTFT(color))}
        >
          Copy TFT Code
        </button>
      </div>
    </main>
  );
}
