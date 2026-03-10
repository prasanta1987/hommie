const defaultCode = `

const bgColor = tft.color565(0,0,255);
const color = tft.color565(255,0,100);
const orange = tft.color565(255, 165, 0);

const _x = 10;
const _y = 10;
const _w = 100;
const _h = 100;
const padding = 0.1;


const pad = (Math.min(_w, _h) * padding); 
const availableW = _w - (pad * 2);
const availableH = _h - (pad * 2);

const scale = (Math.min(availableW, availableH)) / 100.0;

const heartW = (38 * scale);
const circleR = (25 * scale);

const cx = _x + (_w / 2);
const cy = _y + (_h / 2);

tft.drawRoundRect(_x,_y,_w,_h,5,color);

tft.fillCircle(cx - (18 * scale), cy - (15 * scale), circleR,color);
tft.fillCircle(cx + (18 * scale), cy - (15 * scale), circleR, color);
tft.fillTriangle(cx - (37 * scale), cy + (2 * scale),cx + (37 * scale), cy + (2 * scale),cx, cy + (45 * scale), color);



tft.setTextColor(tft.color565(255,0,255)); // White
tft.setTextSize(2);
tft.drawCentreString("MENU", 160, 20);


tft.fillRoundRect(110, 100, 100, 40, 5, orange);
tft.setTextColor(0x0000); // Black text
tft.drawCentreString("START", 160, 112);
`;

export {defaultCode}