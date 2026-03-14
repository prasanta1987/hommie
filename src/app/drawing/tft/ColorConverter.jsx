"use client";
import { useState } from "react";

export default function ColorConverter() {
  const [color, setColor] = useState("#FFFFFF");
  const [tftValue, setTftValue] = useState("0xFFFF");

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
    const cleanHex = input.replace(/^0x/i, "").trim();
    if (cleanHex.length === 4 && /^[0-9A-Fa-f]{4}$/.test(cleanHex)) {
      const val = parseInt(cleanHex, 16);
      const r5 = (val >> 11) & 0x1F;
      const g6 = (val >> 5) & 0x3F;
      const b5 = val & 0x1F;
      const r = (r5 << 3) | (r5 >> 2);
      const g = (g6 << 2) | (g6 >> 4);
      const b = (b5 << 3) | (b5 >> 2);
      const newHex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase()}`;
      setColor(newHex);
    }
  };

  // Standard Picker Change
  const handlePickerChange = (newHex) => {
    setColor(newHex);
    setTftValue(calculateTFT(newHex));
  };

  return (
    <div>
        <h6 className="text-info mb-3 text-center">TFT Color Converter</h6>
        <div className="row g-2">
            <div className="col-6">
                <input
                    type="color"
                    className="form-control form-control-color w-100 border-secondary shadow-sm"
                    value={color}
                    onChange={(e) => handlePickerChange(e.target.value)}
                    style={{ height: '50px', borderRadius: '0.75rem' }}
                />
            </div>
            <div className="col-6 d-flex align-items-center">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control font-monospace bg-dark text-light border-secondary"
                        value={tftValue}
                        onChange={(e) => handleTftInput(e.target.value.toUpperCase())}
                        aria-label="TFT Hex Code"
                    />
                    <button
                        className="btn btn-outline-info"
                        onClick={() => navigator.clipboard.writeText(tftValue)}
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}