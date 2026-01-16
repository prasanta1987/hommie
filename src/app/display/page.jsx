'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { auth, db } from '../firebase/config';
import { ref } from 'firebase/database';
import { setValueToDatabase } from '../miscFunctions/actions';

// A draggable widget component for the sidebar
const DraggableWidget = ({ id, name, onDragStart }) => {
  return (
    <div
      id={id}
      draggable
      onDragStart={onDragStart}
      style={{
        padding: '10px',
        margin: '5px 0',
        border: '1px solid #444',
        borderRadius: '5px',
        cursor: 'grab',
        backgroundColor: '#2a2a2a',
        textAlign: 'center'
      }}
    >
      {name}
    </div>
  );
};

// The main display page component
const DisplayPage = () => {
  const [widgets, setWidgets] = useState([]);
  const virtualScreenRef = useRef(null);
  const [user] = useAuthState(auth);
  const [data, loading, error] = useObjectVal(user ? ref(db, `/${user.uid}/display`) : null);

  // this effect reacts to data changes from the hook
  useEffect(() => {
    if (loading) {
      setWidgets([]);
      return;
    }
    if (error) {
      console.error("Error loading widget data:", error);
      setWidgets([]);
      return;
    }

    if (data && virtualScreenRef.current) {
      const screenRect = virtualScreenRef.current.getBoundingClientRect();
      if (screenRect.width > 0) { // Ensure screen is rendered
          const loadedWidgets = Object.entries(data).map(([name, coords]) => ({
          id: `${name}-${Date.now()}`,
          name: name,
          x: coords.x,
          y: coords.y,
          pixelX: (coords.x / 320) * screenRect.width,
          pixelY: (coords.y / 240) * screenRect.height,
        }));
        setWidgets(loadedWidgets);
      }
    } else {
      setWidgets([]);
    }
  }, [data, loading, error, user]);

  // Handles starting the drag from the sidebar
  const handleDragStart = (e) => {
    e.dataTransfer.setData('widgetId', e.target.id);
  };

  // Handles starting the drag of a widget already on the screen
  const handleWidgetDragStart = (e, widgetId) => {
    e.dataTransfer.setData('widgetId', widgetId);
  };

  // Allows the virtual screen to be a drop target
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handles dropping a widget onto the virtual screen
  const handleDrop = (e) => {
    e.preventDefault();
    if (!user) return; // a user must be logged in

    const widgetId = e.dataTransfer.getData('widgetId');
    const screenRect = virtualScreenRef.current.getBoundingClientRect();

    // Calculate drop position relative to the screen
    let x = e.clientX - screenRect.left;
    let y = e.clientY - screenRect.top;

    // Ensure the drop is within the screen bounds
    x = Math.max(0, Math.min(x, screenRect.width));
    y = Math.max(0, Math.min(y, screenRect.height));

    // Scale coordinates to the 320x240 system
    const scaledX = Math.round((x / screenRect.width) * 320);
    const scaledY = Math.round((y / screenRect.height) * 240);
    
    const existingWidgetIndex = widgets.findIndex(w => w.id === widgetId);

    let newWidgets;
    if (existingWidgetIndex > -1) {
      // Update position of existing widget on screen
      newWidgets = [...widgets];
      newWidgets[existingWidgetIndex] = {
        ...newWidgets[existingWidgetIndex],
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y
      };
    } else {
      // Add a new widget from the sidebar
      const newWidget = {
        id: `${widgetId}-${Date.now()}`,
        name: widgetId,
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y
      };
      newWidgets = [...widgets, newWidget];
    }
    setWidgets(newWidgets);

    // Update the database
    const dataToSend = newWidgets.reduce((acc, widget) => {
      acc[widget.name] = { x: widget.x, y: widget.y };
      return acc;
    }, {});
    setValueToDatabase(`/${user.uid}/display`, dataToSend);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', color: 'white', backgroundColor: '#1e1e1e' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', borderRight: '1px solid #444', padding: '20px', backgroundColor: '#252526' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Widgets</h2>
        <DraggableWidget id="Clock" name="Clock" onDragStart={handleDragStart} />
        <DraggableWidget id="Weather" name="Weather" onDragStart={handleDragStart} />
        <DraggableWidget id="Calendar" name="Calendar" onDragStart={handleDragStart} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h2>Virtual Screen</h2>
        <div
          ref={virtualScreenRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            width: '480px', 
            height: '360px', // 4:3 aspect ratio
            border: '2px dashed #555',
            borderRadius: '10px',
            position: 'relative',
            backgroundColor: '#333333',
            boxShadow: '0 0 20px rgba(0,0,0,0.5) inset'
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              draggable
              onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
              style={{
                position: 'absolute',
                left: widget.pixelX,
                top: widget.pixelY,
                transform: 'translate(-50%, -50%)',
                padding: '8px 12px',
                border: '1px solid #666',
                borderRadius: '5px',
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                backdropFilter: 'blur(5px)',
                cursor: 'grab',
                userSelect: 'none'
              }}
            >
              {widget.name}: ({widget.x}, {widget.y})
            </div>
          ))}
        </div>
        <div style={{width: '480px'}}>
          <h3>Widget Coordinates:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {widgets.map(w => (
              <li key={w.id} style={{ backgroundColor: '#2a2a2a', padding: '5px 10px', borderRadius: '3px', margin: '5px 0' }}>
                {`${w.name} (${w.id.slice(-4)}) is at (${w.x}, ${w.y})`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DisplayPage;
