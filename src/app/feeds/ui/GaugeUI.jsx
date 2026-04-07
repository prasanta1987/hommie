import React from 'react';
import GaugeComponent from 'react-gauge-component';

const GaugeUI = ({ value, minValue, maxValue }) => {

    return (
        <GaugeComponent
            value={value}
            type="semicircle"
            minValue={minValue}
            maxValue={maxValue}
            arc={{
                width: 0.22,
                cornerRadius: 6,
                gradient: false,
                subArcs: [],
                nbSubArcs: 4,
                colorArray: ["#2ca8e1", "#F5CD19", "#EA4228"],
                padding: 0.01,
                effects: { glow: false, glowBlur: 3, glowSpread: 3 },
                subArcsStrokeWidth: 0
            }}
            pointer={{
                type: "arrow",
                elastic: true,
                animationDelay: 0,
                animationDuration: 1141,
                length: 0.2,
                // width: 10,
                // color: "#c8d4d6",
                // baseColor: "#ffffff",
                // strokeWidth: 1,
                // strokeColor: "rgba(255,255,255,0.5)",
                maxFps: 60
            }}
            labels={{
                valueLabel: {
                    formatTextValue: e => "".concat(e, ""),
                    matchColorWithArc: true,
                    style: { fontSize: "60px", fontWeight: "bold", stroke: '#2f6ae9', strokeWidth: '0.1px' },
                    hide: false,
                    animateValue: false,
                    offsetX: 0,
                    offsetY: 25
                },
                tickLabels: {
                    type: "outer",
                    hideMinMax: true,
                    defaultTickValueConfig: { hide: true },
                    defaultTickLineConfig: { hide: true },
                    ticks: []
                }
            }}
            startAngle={-110}
            endAngle={110}
        />
    );
};

export default GaugeUI;





// <GaugeComponent
//   value={29.4}
//   type="semicircle"
//   minValue={-40}
//   maxValue={60}
//   arc={{
//       width: 0.22,
//       cornerRadius: 6,
//       gradient: false,
//       subArcs: [],
//       nbSubArcs: 3,
//       colorArray: ["#5BE12C", "#F5CD19", "#EA4228"],
//       padding: 0.02,
//       effects: { glow: false, glowBlur: 3, glowSpread: 3 },
//       subArcsStrokeWidth: 0
//     }}
//   pointer={{
//       type: "arrow",
//       elastic: false,
//       animationDelay: 150,
//       animationDuration: 100,
//       length: 0.8558179773268897,
//       width: 14,
//       color: "#48cae4",
//       baseColor: "#ffffff",
//       strokeWidth: 1,
//       strokeColor: "rgba(255,255,255,0.5)",
//       maxFps: 56,
//       animate: false
//     }}
//   labels={{
//       valueLabel: {
//         formatTextValue: e=>"".concat(Math.round(e),"\xb0C"),
//         matchColorWithArc: false,
//         style: { fontSize: "72px", fontWeight: "bold" },
//         hide: false,
//         animateValue: true,
//         offsetX: 4,
//         offsetY: 36
//       },
//       tickLabels: {
//         type: "outer",
//         hideMinMax: true,
//         defaultTickValueConfig: { hide: true },
//         defaultTickLineConfig: { hide: true },
//         ticks: []
//       }
//     }}
//   startAngle={-110}
//   endAngle={110}
// />