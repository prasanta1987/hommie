'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { auth, db } from '../firebase/config';
import { ref as databaseRef, remove } from 'firebase/database';
import { updateValuesToDatabase } from '../miscFunctions/actions';
import { Spinner } from "react-bootstrap";
import ClockWidget from './ui/ClockWidget';
import DateWidget from './ui/DateWidget';

// A draggable widget component for the sidebar
const DraggableWidget = ({ id, name, onDragStart }) => {
  return (
    <div
      id={name} // Use name as the draggable id
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
  const [selectedWidget, setSelectedWidget] = useState(null); // This will now store the widget name
  const [backgroundColor, setBackgroundColor] = useState('#333333');

  // this effect reacts to data changes from the hook
  useEffect(() => {
    if (data && virtualScreenRef.current) {
      const { bgColour, ...widgetsData } = data;
      if (bgColour) {
        setBackgroundColor(bgColour);
      }
      
      const screenRect = virtualScreenRef.current.getBoundingClientRect();
      if (screenRect.width > 0) {
          const loadedWidgets = Object.entries(widgetsData).map(([name, props]) => ({
            name: name,
            ...props,
            color: typeof props.color === 'string' ? props.color : '#ffffff',
            fontSize: props.fontSize || 2, // Default font size
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
    e.dataTransfer.setData('widgetName', e.target.id);
  };

  // Handles starting the drag of a widget already on the screen
  const handleWidgetDragStart = (e, widgetName) => {
    e.dataTransfer.setData('widgetName', widgetName);
    setSelectedWidget(widgetName);
  };

  // Allows the virtual screen to be a drop target
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handles dropping a widget onto the virtual screen
  const handleDrop = (e) => {
    e.preventDefault();
    if (!user) return;

    const widgetName = e.dataTransfer.getData('widgetName');
    const screenRect = virtualScreenRef.current.getBoundingClientRect();

    let x = e.clientX - screenRect.left;
    let y = e.clientY - screenRect.top;

    x = Math.max(0, Math.min(x, screenRect.width));
    y = Math.max(0, Math.min(y, screenRect.height));

    const scaledX = Math.round((x / screenRect.width) * 320);
    const scaledY = Math.round((y / screenRect.height) * 240);
    
    const existingWidgetIndex = widgets.findIndex(w => w.name === widgetName);

    let newWidgets;
    if (existingWidgetIndex > -1) {
      newWidgets = [...widgets];
      newWidgets[existingWidgetIndex] = {
        ...newWidgets[existingWidgetIndex],
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y
      };
    } else {
      const newWidget = {
        name: widgetName,
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y,
        color: '#ffffff',
        fontSize: 2
      };
      newWidgets = [...widgets, newWidget];
    }
    setWidgets(newWidgets);
    setSelectedWidget(widgetName);

    const dataToSend = newWidgets.reduce((acc, widget) => {
      acc[widget.name] = { x: widget.x, y: widget.y, color: widget.color, fontSize: widget.fontSize };
      return acc;
    }, {});
    updateValuesToDatabase(`/${user.uid}/display`, dataToSend);
  };
  
  const handleDeleteDrop = (e) => {
    e.preventDefault();
    if (!user) return;

    const widgetName = e.dataTransfer.getData('widgetName');
    const widgetToRemove = widgets.find(w => w.name === widgetName);

    if (widgetToRemove) {
      const newWidgets = widgets.filter(w => w.name !== widgetName);
      setWidgets(newWidgets);
      const widgetRef = databaseRef(db, `/${user.uid}/display/${widgetToRemove.name}`);
      remove(widgetRef);
    }
  };

  const handlePropertyChange = (property, value) => {
    if (!selectedWidget) return;
    const newWidgets = widgets.map(w => {
        if (w.name === selectedWidget) {
            return { ...w, [property]: value };
        }
        return w;
    });
    setWidgets(newWidgets);
  };

  const handlePropertySave = () => {
    if (!selectedWidget) return;
    const widgetToUpdate = widgets.find(w => w.name === selectedWidget);
    if (widgetToUpdate) {
        const dataToSend = {
            x: widgetToUpdate.x,
            y: widgetToUpdate.y,
            color: widgetToUpdate.color,
            fontSize: widgetToUpdate.fontSize,
        };
        updateValuesToDatabase(`/${user.uid}/display/${widgetToUpdate.name}`, dataToSend);
    }
  };

  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
  };

  const handleBackgroundColorSave = () => {
      if (!user) return;
      updateValuesToDatabase(`/${user.uid}/display`, { bgColour: backgroundColor });
  };

  const handleDeselect = () => {
    setSelectedWidget(null);
  };

  const selectedWidgetObject = widgets.find(w => w.name === selectedWidget);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', color: 'white', backgroundColor: '#1e1e1e' }}>
      {/* Left Sidebar (Widgets) */}
      <div style={{ width: '200px', borderRight: '1px solid #444', padding: '20px', backgroundColor: '#252526' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Widgets</h2>
        <DraggableWidget name="Clock" onDragStart={handleDragStart} />
        <DraggableWidget name="Date" onDragStart={handleDragStart} />
      </div>

      {/* Main Content (Virtual Screen) */}
      <div onClick={handleDeselect} style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          ref={virtualScreenRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            width: '480px', 
            height: '360px',
            border: '2px dashed #555',
            borderRadius: '10px',
            position: 'relative',
            backgroundColor: backgroundColor,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.5) inset'
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.name}
              id={widget.name}
              draggable
              onDragStart={(e) => handleWidgetDragStart(e, widget.name)}
              onClick={(e) => {e.stopPropagation(); setSelectedWidget(widget.name)} }
              style={{
                position: 'absolute',
                left: widget.pixelX,
                top: widget.pixelY,
                transform: 'translate(-50%, -50%)',
                padding: '8px 12px',
                border: selectedWidget === widget.name ? '2px solid #007bff' : '1px solid #666',
                borderRadius: '5px',
                // backgroundColor: 'rgba(42, 42, 42, 0.8)',
                backdropFilter: 'blur(5px)',
                cursor: 'grab',
                userSelect: 'none',
                color: widget.color,
              }}
            >
              {widget.name === 'Clock' && <ClockWidget color={widget.color} fontSize={widget.fontSize} />}
              {widget.name === 'Date' && <DateWidget color={widget.color} fontSize={widget.fontSize} />}
              {widget.name !== 'Clock' && widget.name !== 'Date' && widget.name}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar (Properties & Delete) */}
      <div style={{ width: '200px', borderLeft: '1px solid #444', padding: '20px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Screen Properties</h3>
            <label>Background Color</label>
            <input
                type="color"
                value={backgroundColor}
                onChange={handleBackgroundColorChange}
                onBlur={handleBackgroundColorSave}
                style={{ width: '100%' }}
            />
        </div>
        {selectedWidget && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Widget Properties</h3>
            <div>
                <label>Color</label>
                <input 
                    type="color" 
                    value={selectedWidgetObject?.color || '#ffffff'} 
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    onBlur={handlePropertySave}
                    style={{ width: '100%' }} 
                />
            </div>
            <div style={{ marginTop: '10px' }}>
                <label>Font Size: {selectedWidgetObject?.fontSize}</label>
                <input 
                    type="range" 
                    min="1" 
                    max="7" 
                    value={selectedWidgetObject?.fontSize || 2} 
                    onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value, 10))}
                    onMouseUp={handlePropertySave}
                    style={{ width: '100%' }}
                />
            </div>
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
    </div>
  );
};

export default DisplayPage;
