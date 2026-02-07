'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { auth, db } from '../../firebaseConfig/config';
import { ref as databaseRef, remove } from 'firebase/database';
import { updateValuesToDatabase } from '../miscFunctions/actions';
import { Spinner } from "react-bootstrap";
import SignIn from '../components/sign-in';
import GaugeUI from '../feeds/ui/GaugeUI';
import SliderUI from '../feeds/ui/SliderUI';
import ToggleUI from '../feeds/ui/ToggleUI';
import ColourPickerUI from '../feeds/ui/ColourPickerUI';

const feedTypeToComponent = {
  gauge: GaugeUI,
  slider: SliderUI,
  toggle: ToggleUI,
  color: ColourPickerUI,
};

// A draggable widget component for the sidebar
const DraggableWidget = ({ id, name, onDragStart }) => {
  return (
    <div
      id={id} // Use name as the draggable id
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
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [data, dataLoading, dataError] = useObjectVal(user && selectedDevice ? databaseRef(db, `/${user.uid}/${selectedDevice}/display`) : null);
  const [devFeeds] = useObjectVal(user && selectedDevice ? databaseRef(db, `${user.uid}/${selectedDevice}/devFeeds`) : null);
  const [allUserData] = useObjectVal(user ? databaseRef(db, `/${user.uid}`) : null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#333333');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    if (allUserData) {
      const deviceKeys = Object.keys(allUserData);
      const devicesData = deviceKeys.map(key => ({
        code: key,
        name: allUserData[key].deviceName || key
      }));
      setDevices(devicesData);
      if (devicesData.length > 0 && !selectedDevice) {
        setSelectedDevice(devicesData[0].code);
      }
    }
  }, [allUserData, selectedDevice]);

  useEffect(() => {
    if (data && devFeeds && virtualScreenRef.current) {
      const { bgColour, ...widgetsData } = data;
      if (bgColour) {
        setBackgroundColor(bgColour);
      }
      
      const screenRect = virtualScreenRef.current.getBoundingClientRect();
      if (screenRect.width > 0) {
          const loadedWidgets = Object.entries(widgetsData).map(([name, props]) => {
            let widgetType = props.type;
            if (!widgetType && devFeeds[name]) {
                widgetType = devFeeds[name].type;
            }

            return {
                name: name,
                ...props,
                type: widgetType,
                color: typeof props.color === 'string' ? props.color : '#ffffff',
                backgroundColor: typeof props.backgroundColor === 'string' ? props.backgroundColor : 'transparent',
                fontSize: props.fontSize || 2,
                pixelX: (props.x / 320) * screenRect.width,
                pixelY: (props.y / 240) * screenRect.height,
            }
          });
        setWidgets(loadedWidgets);
		setLastUpdateTime(new Date());
      }
    } else if (!data) {
      setWidgets([]);
    }
  }, [data, devFeeds, user]);

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

  if (!user) {
    return <SignIn />;
  }

  const handleDragStart = (e, feedId) => {
    e.dataTransfer.setData('feedId', feedId);
  };

  const handleWidgetDragStart = (e, widgetName) => {
    e.dataTransfer.setData('widgetName', widgetName);
    setSelectedWidget(widgetName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!user || !selectedDevice) return;
  
    const feedId = e.dataTransfer.getData('feedId');
    const widgetName = e.dataTransfer.getData('widgetName');
    const screenRect = virtualScreenRef.current.getBoundingClientRect();
  
    let x = e.clientX - screenRect.left;
    let y = e.clientY - screenRect.top;
  
    x = Math.max(0, Math.min(x, screenRect.width));
    y = Math.max(0, Math.min(y, screenRect.height));
  
    const scaledX = Math.round((x / screenRect.width) * 320);
    const scaledY = Math.round((y / screenRect.height) * 240);
      
    const id = feedId || widgetName;
    if (!id) return;

    const existingWidgetIndex = widgets.findIndex(w => w.name === id);
  
    let newWidgets;
    if (existingWidgetIndex > -1) {
      newWidgets = [...widgets];
      newWidgets[existingWidgetIndex] = {
        ...newWidgets[existingWidgetIndex],
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y,
      };
    } else if (feedId) {
      const feed = devFeeds[feedId];
      if (!feed) return;
      const newWidget = {
        name: feedId,
        type: feed.type,
        x: scaledX,
        y: scaledY,
        pixelX: x,
        pixelY: y,
        color: '#ffffff',
        backgroundColor: 'transparent',
        fontSize: 2,
      };
      newWidgets = [...widgets, newWidget];
    } else {
      return;
    }

    setWidgets(newWidgets);
    setSelectedWidget(id);
  
    const dataToSend = newWidgets.reduce((acc, widget) => {
      acc[widget.name] = { 
        x: widget.x, 
        y: widget.y, 
        color: widget.color, 
        backgroundColor: widget.backgroundColor,
        fontSize: widget.fontSize,
        type: widget.type,
      };
      return acc;
    }, {});
    updateValuesToDatabase(`/${user.uid}/${selectedDevice}/display`, dataToSend);
  };

  const handleDeleteDrop = (e) => {
    e.preventDefault();
    if (!user || !selectedDevice) return;

    const widgetName = e.dataTransfer.getData('widgetName');
    const widgetToRemove = widgets.find(w => w.name === widgetName);

    if (widgetToRemove) {
      const newWidgets = widgets.filter(w => w.name !== widgetName);
      setWidgets(newWidgets);
      setSelectedWidget(null);
      const widgetRef = databaseRef(db, `/${user.uid}/${selectedDevice}/display/${widgetToRemove.name}`);
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
    if (!selectedWidget || !selectedDevice) return;
    const widgetToUpdate = widgets.find(w => w.name === selectedWidget);
    if (widgetToUpdate) {
        const dataToSend = {
            x: widgetToUpdate.x,
            y: widgetToUpdate.y,
            color: widgetToUpdate.color,
            backgroundColor: widgetToUpdate.backgroundColor,
            fontSize: widgetToUpdate.fontSize,
            type: widgetToUpdate.type,
        };
        updateValuesToDatabase(`/${user.uid}/${selectedDevice}/display/${widgetToUpdate.name}`, dataToSend);
    }
  };

  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
  };

  const handleBackgroundColorSave = () => {
      if (!user || !selectedDevice) return;
      updateValuesToDatabase(`/${user.uid}/${selectedDevice}/display`, { bgColour: backgroundColor });
  };

  const handleScreenClick = () => {
    setSelectedWidget(null);
  };

  const handleWidgetClick = (e, widgetName) => {
    e.stopPropagation();
    setSelectedWidget(widgetName);
  }

  const selectedWidgetObject = widgets.find(w => w.name === selectedWidget);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', color: 'white', backgroundColor: '#1e1e1e' }}>
      {/* Left Sidebar (Widgets) */}
      <div style={{ width: '200px', borderRight: '1px solid #444', padding: '20px', backgroundColor: '#252526' }}>
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Devices</h3>
            <select
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
            >
              {devices.map(device => (
                <option key={device.code} value={device.code}>{device.name}</option>
              ))}
            </select>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Feeds</h2>
        {devFeeds && Object.entries(devFeeds).map(([feedId, feed]) => (
            feed.type == "Toggle"&& <DraggableWidget key={feedId} id={feedId} name={feedId} onDragStart={(e) => handleDragStart(e, feedId)} />
        ))}
      </div>

      {/* Main Content (Virtual Screen) */}
      <div onClick={handleScreenClick} style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          {widgets.map((widget) => {
            return (
                <div
                key={widget.name}
                id={widget.name}
                draggable
                onDragStart={(e) => handleWidgetDragStart(e, widget.name)}
                onClick={(e) => handleWidgetClick(e, widget.name)}
                style={{
                    position: 'absolute',
                    left: widget.pixelX,
                    top: widget.pixelY,
                    transform: 'translate(-50%, -50%)',
                    padding: '8px 12px',
                    border: selectedWidget === widget.name ? '2px solid #007bff' : '1px solid #666',
                    borderRadius: '5px',
                    backgroundColor: widget.backgroundColor,
                    cursor: 'grab',
                    userSelect: 'none',
                    color: widget.color,
                    textAlign: 'center'
                }}
                >
                <div style={{ marginBottom: '5px' }}>{widget.name}</div>
                </div>
            )
          })}
        </div>
		{lastUpdateTime && (
			<div style={{ position: 'absolute', top: '20px', right: '20px', color: '#aaa', fontSize: '12px' }}>
				Last updated: {lastUpdateTime.toLocaleTimeString()}
			</div>
		)}
      </div>

      {/* Right Sidebar (Properties & Delete) */}
      <div style={{ width: '200px', borderLeft: '1px solid #444', padding: '20px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column' }}>
        {!selectedWidget ? (
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
        ) : (
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
                <label>Background Color</label>
                <input 
                    type="color" 
                    value={selectedWidgetObject?.backgroundColor || '#000000'} 
                    onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
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
