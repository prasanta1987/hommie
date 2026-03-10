const defaultCode = `

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
`;

export {defaultCode}