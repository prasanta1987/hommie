"use client";
import { useState } from "react";

export default function TftConverter() {
  const [color, setColor] = useState("#21575e");
  const [tftValue, setTftValue] = useState("0x07E0");

  // RGB888 to TFT_eSPI (RGB565)
  const calculateTFT = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const val = ((r & 0xf8) << 8) | ((g & 0xfc) << 3) | (b >> 3);
    return `0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
  };

  // REVERSE: TFT_eSPI (RGB565) to RGB888
const handleTftInput = (input) => {
  setTftValue(input); // Keep UI synced while typing
  
  // 1. Remove 0x prefix and any whitespace
  const cleanHex = input.replace(/^0x/i, "").trim();

  // 2. Only convert if we have a valid 4-digit 16-bit hex code
  if (cleanHex.length === 4 && /^[0-9A-Fa-f]{4}$/.test(cleanHex)) {
    const val = parseInt(cleanHex, 16);

    // 3. Extract bits for 5-6-5 format
    const r5 = (val >> 11) & 0x1F;
    const g6 = (val >> 5) & 0x3F;
    const b5 = val & 0x1F;

    // 4. Scale bits to 8-bit (0-255) using bit-duplication for accuracy
    const r = (r5 << 3) | (r5 >> 2);
    const g = (g6 << 2) | (g6 >> 4);
    const b = (b5 << 3) | (b5 >> 2);
    
    // 5. Build Hex string using bitwise math (0x1000000 ensures leading zeros)
    const newHex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
    
    setColor(newHex); // Update background and RGB display
  }
};


  // Standard Picker Change
  const handlePickerChange = (newHex) => {
    setColor(newHex);
    setTftValue(calculateTFT(newHex));
  };

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

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
        style={{ borderRadius: "2rem", width: "300px", backdropFilter: "blur(8px)" }}
      >
        <h4 className="fw-bold mb-2">Color Converter</h4>

        {/* Color Picker Input */}
        <input
          type="color"
          className="form-control form-control-color w-100 border-0 mb-2 shadow-sm"
          value={color}
          onChange={(e) => handlePickerChange(e.target.value)}
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
            <span className="h4 font-monospace text-light">
              {r}, {g}, {b}
            </span>
          </div>

          {/* TFT_eSPI SECTION (REVERSE ENABLED) */}
          <div className="list-group-item bg-transparent text-white border-0 mt-2">
            <div className="bg-warning bg-opacity-10 p-3 rounded-4 border border-warning">
              <small className="text-warning d-block fw-bold">TFT_eSPI (RGB565)</small>
              <input 
                type="text"
                className="display-5 font-monospace fw-bold text-warning bg-transparent border-0 text-center w-100"
                value={tftValue}
                onChange={(e) => handleTftInput(e.target.value.toUpperCase())}
              />
              <small className="text-warning opacity-50 d-block mt-1">Edit value to reverse</small>
            </div>
          </div>
        </div>

        <button 
          className="btn w-50 btn-outline-light btn-sm mt-3 rounded-pill"
          onClick={() => navigator.clipboard.writeText(tftValue)}
        >
          Copy TFT Code
        </button>
      </div>
    </main>
  );
}
