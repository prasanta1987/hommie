"use client"

import React, { useEffect, useState,useRef  } from "react"
import './midi.css'

const Midi = () => {
  const [status, setStatus] = useState("Connect Keyboard via USB");
  const [lastIncoming, setLastIncoming] = useState(null);
  const [slots, setSlots] = useState(Array(10).fill(null));
  const midiAccessRef = useRef(null);
  const currentBank = useRef({ msb: 0, lsb: 0 });

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(access => {
        midiAccessRef.current = access;
        setStatus("Keyboard Active");
        access.inputs.forEach(input => {
          input.onmidimessage = (msg) => {
            const [cmd, d1, d2] = msg.data;
            const type = cmd & 0xf0;
            if (type === 0xb0 && d1 === 0) currentBank.current.msb = d2;
            if (type === 0xb0 && d1 === 32) currentBank.current.lsb = d2;
            if (type === 0xc0) {
              setLastIncoming({ msb: currentBank.current.msb, lsb: currentBank.current.lsb, pc: d1 });
            }
          };
        });
      });
    }
  }, []);

  const saveToSlot = (index) => {
    if (!lastIncoming) return alert("Change a tone on the keyboard first!");
    const newSlots = [...slots];
    newSlots[index] = { ...lastIncoming, name: `Tone ${lastIncoming.pc + 1}` };
    setSlots(newSlots);
  };

  const playSlot = (slot) => {
    if (!slot || !midiAccessRef.current) return;
    midiAccessRef.current.outputs.forEach(out => {
      out.send([0xb0, 0, slot.msb]);  // Bank Select MSB
      out.send([0xb0, 32, slot.lsb]); // Bank Select LSB
      out.send([0xc0, slot.pc]);      // Program Change
    });
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>Status: {status}</div>
      
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <small>Current Keyboard Output:</small>
        <div style={{ fontWeight: 'bold' }}>
          {lastIncoming ? `MSB:${lastIncoming.msb} LSB:${lastIncoming.lsb} PC:${lastIncoming.pc}` : "Waiting for MIDI..."}
        </div>
      </div>

      <div className="midi-container">
        {slots.map((slot, i) => (
          <div key={i} className="d-flex gap-1 flex-column midi-slot">
            <button 
              onClick={() => playSlot(slot)}
              disabled={!slot}
              className={`btn ${slot ? 'btn-success' : 'btn-secondary'}`}
              style={{height: '70px'}}
            >
              {slot ? `Recall: ${slot.name}` : `Slot ${i + 1} Empty`}
            </button>
            <button 
              onClick={() => saveToSlot(i)}
              className="btn btn-sm btn-primary"
            >
              Save Current
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Midi;
