'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { auth, db } from '../firebase/config';
import { ref as databaseRef, remove } from 'firebase/database';
import { updateValuesToDatabase } from '../miscFunctions/actions';
import { Spinner } from "react-bootstrap";
import ClockWidget from './ui/ClockWidget';

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
  const [user, authLoading, authError] = useAuthState(auth);
  const [data, dataLoading, dataError] = useObjectVal(user ? databaseRef(db, `/${user.uid}/display`) : null);
  const [selectedWidget, setSelectedWidget] = useState(null);

  // this effect reacts to data changes from the hook
  useEffect(() => {
    if (data && virtualScreenRef.current) {
      const { background, ...widgetsData } = data;
      
      const screenRect = virtualScreenRef.current.getBoundingClientRect();
      if (screenRect.width > 0) {
          const loadedWidgets = Object.entries(widgetsData).map(([name, props]) => ({
            id: `${name}-${Date.now()}`,
            name: name,
            ...props,
            // Ensure color is a string, default to white if not present
            color: typeof props.color === 'string' ? props.color : '#ffffff',
            pixelX: (props.x / 320) * screenRect.width,
            pixelY: (props.y / 240) * screenRect.height,
          }));
        setWidgets(loadedWidgets);
      }
    } else {
      setWidgets([]);
    }
  }, [data, user]);

  if (authLoading || dataLoading) {
    return (
      <div className='text-center flex-grow-1 d-flex justify-content-center align-items-center'>
        <Spinner animation="grow" variant="info" size="lg" />
      </div>
    );
  }

  if (authError || dataError) {
      return <div>Error: {authError?.message || dataError?.message}</div>
  }

  // Handles starting the drag from the sidebar
  const handleDragStart = (e) => {
    e.dataTransfer.setData('widgetId', e.target.id);
  };

  // Handles starting the drag of a widget already on the screen
  const handleWidgetDragStart = (e, widgetId) => {
    e.dataTransfer.setData('widgetId', widgetId);
    setSelectedWidget(widgetId);
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
        pixelY: y,
        color: '#ffffff'
      };
      newWidgets = [...widgets, newWidget];
    }
    setWidgets(newWidgets);
    setSelectedWidget(widgetId);

    // Update the database
    const dataToSend = newWidgets.reduce((acc, widget) => {
      acc[widget.name] = { x: widget.x, y: widget.y, color: widget.color };
      return acc;
    }, {});
    updateValuesToDatabase(`/${user.uid}/display`, dataToSend);
  };
  
  const handleDeleteDrop = (e) => {
    e.preventDefault();
    if (!user) return;

    const widgetId = e.dataTransfer.getData('widgetId');
    const widgetToRemove = widgets.find(w => w.id === widgetId);

    if (widgetToRemove) {
      const newWidgets = widgets.filter(w => w.id !== widgetId);
      setWidgets(newWidgets);

      // Remove the widget from Firebase Realtime Database
      const widgetRef = databaseRef(db, `/${user.uid}/display/${widgetToRemove.name}`);
      remove(widgetRef);
    }
  };

  const handleColorChange = (e) => {
    if (!selectedWidget) return;

    const newColor = e.target.value;
    
    const newWidgets = widgets.map(w => {
        if (w.id === selectedWidget) {
            return { ...w, color: newColor };
        }
        return w;
    });
    setWidgets(newWidgets);

    const widgetToUpdate = newWidgets.find(w => w.id === selectedWidget);
    if (widgetToUpdate) {
        const dataToSend = {
            x: widgetToUpdate.x,
            y: widgetToUpdate.y,
            color: newColor
        }
        updateValuesToDatabase(`/${user.uid}/display/${widgetToUpdate.name}`, dataToSend);
    }
  };

  const handleDeselect = () => {
    setSelectedWidget(null);
  };

  const selectedWidgetObject = widgets.find(w => w.id === selectedWidget);
  const selectedColor = selectedWidgetObject ? selectedWidgetObject.color : '#ffffff';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', color: 'white', backgroundColor: '#1e1e1e' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', borderRight: '1px solid #444', padding: '20px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Widgets</h2>
          <DraggableWidget id="Clock" name="Clock" onDragStart={handleDragStart} />
          <DraggableWidget id="Weather" name="Weather" onDragStart={handleDragStart} />
          <DraggableWidget id="Calendar" name="Calendar" onDragStart={handleDragStart} />
        </div>
        {selectedWidget && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Widget Color</h3>
            <input type="color" value={selectedColor} onChange={handleColorChange} style={{ width: '100%' }} />
          </div>
        )}
        <div
            onDragOver={handleDragOver}
            onDrop={handleDeleteDrop}
            style={{
              marginTop: 'auto',
              padding: '20px',
              border: '2px dashed #dc3545',
              borderRadius: '5px',
              textAlign: 'center',
              color: '#dc3545',
              cursor: 'pointer'
            }}
          >
            Drag here to delete
          </div>
      </div>

      {/* Main Content */}
      <div onClick={handleDeselect} style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
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
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.5) inset'
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              draggable
              onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
              onClick={(e) => {e.stopPropagation(); setSelectedWidget(widget.id)} }
              style={{
                position: 'absolute',
                left: widget.pixelX,
                top: widget.pixelY,
                transform: 'translate(-50%, -50%)',
                padding: '8px 12px',
                border: selectedWidget === widget.id ? '2px solid #007bff' : '1px solid #666',
                borderRadius: '5px',
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                backdropFilter: 'blur(5px)',
                cursor: 'grab',
                userSelect: 'none',
                color: widget.color
              }}
            >
              {widget.name === 'Clock' ? <ClockWidget color={widget.color} /> : widget.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayPage;
