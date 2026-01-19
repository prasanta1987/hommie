'use client';

import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { FiHardDrive, FiZap, FiXCircle, FiPlus, FiSettings, FiMonitor, FiAlertTriangle } from 'react-icons/fi';
import styles from './monitor.module.css';

const MonitorPage = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [port, setPort] = useState(null);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [baudRate, setBaudRate] = useState(9600);
  const [data, setData] = useState('');
  const [reader, setReader] = useState(null);

  useEffect(() => {
    // Check for Web Serial API support
    if (!('serial' in navigator)) {
      setIsSupported(false);
      return;
    }

    const getPorts = async () => {
      try {
        const ports = await navigator.serial.getPorts();
        setAvailablePorts(ports);
      } catch (error) {
        console.warn('Could not retrieve serial ports:', error);
      }
    };
    
    const handlePortChange = () => {
      getPorts();
    };

    navigator.serial?.addEventListener('connect', handlePortChange);
    navigator.serial?.addEventListener('disconnect', handlePortChange);
    getPorts();

    return () => {
      navigator.serial?.removeEventListener('connect', handlePortChange);
      navigator.serial?.removeEventListener('disconnect', handlePortChange);
    };
  }, []);

  useEffect(() => {
    if (availablePorts.length > 0 && !port) { // Don't change selection if already connected
        const newPortStillAvailable = availablePorts.some(p => p === selectedPort);
        if(!newPortStillAvailable){
            setSelectedPort(availablePorts[0]);
        }
    }
    if (availablePorts.length === 0) {
        setSelectedPort(null);
    }
  }, [availablePorts, port, selectedPort]);


  const requestPort = async () => {
    try {
      await navigator.serial.requestPort();
    } catch (error) {
      console.log('User did not select a port.');
    }
  };

  const connectToSerial = async () => {
    if (!selectedPort) {
      alert('Please select a port first.');
      return;
    }
    try {
      await selectedPort.open({ baudRate });
      setPort(selectedPort);
      readData(selectedPort);
    } catch (error) {
      console.error(`Error connecting to serial port: ${error.message}`);
    }
  };

  const readData = async (serialPort) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    setReader(reader);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        setData((prevData) => prevData + value);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Error reading from serial port: ${error.message}`);
      }
    }
  };

  const disconnectFromSerial = async () => {
    if (reader) {
      await reader.cancel().catch(() => {});
    }
    if (port) {
      try {
        // This is a bit of a hack to make sure the reader is released before closing the port
        await port.readable.getReader().closed;
      } catch(e){}
      await port.close().catch(() => {});
      setPort(null);
    }
    setData('');
  };

  useEffect(() => {
    return () => {
      if (port) {
        disconnectFromSerial();
      }
    };
  }, [port]);

  if (!isSupported) {
    return (
      <div className={styles.unsupportedContainer}>
        <FiAlertTriangle size={60} color="#e53e3e" />
        <h2>Web Serial API Not Supported</h2>
        <p>
          Your browser does not support the Web Serial API, which is required for this feature.
        </p>
        <p>
          Please use a compatible browser like Google Chrome, Microsoft Edge, or Opera on a desktop computer.
        </p>
      </div>
    );
  }


  return (
    <div className={styles.monitorPage}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <h2><FiSettings /> Connection</h2>
        </header>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="port-select"><FiHardDrive /> Port</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Form.Select
                id="port-select"
                className={styles.select}
                onChange={(e) => {
                  const selected = availablePorts[e.target.value];
                  setSelectedPort(selected);
                }}
                value={selectedPort ? availablePorts.indexOf(selectedPort) : ''}
                disabled={!!port || availablePorts.length === 0}
              >
                <option value="" disabled={availablePorts.length > 0}>Select a port</option>
                {availablePorts.map((p, i) => (
                  <option key={i} value={i}>
                    {p.getInfo().usbVendorId ? `Port ${i+1} (Vendor: ${p.getInfo().usbVendorId})` : `Port ${i + 1}`}
                  </option>
                ))}
              </Form.Select>
              <button title="Request New Port" className={`${styles.button} ${styles.secondaryButton}`} onClick={requestPort} disabled={!!port}>
                <FiPlus />
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="baud-rate-select">Baud Rate</label>
            <Form.Select
              id="baud-rate-select"
              className={styles.select}
              value={baudRate}
              onChange={(e) => setBaudRate(parseInt(e.target.value))}
              disabled={!!port}
            >
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
            </Form.Select>
          </div>

          {port ? (
            <button className={`${styles.button} ${styles.dangerButton}`} onClick={disconnectFromSerial}>
              <FiXCircle /> Disconnect
            </button>
          ) : (
            <button className={`${styles.button} ${styles.primaryButton}`} onClick={connectToSerial} disabled={!selectedPort}>
              <FiZap /> Connect
            </button>
          )}
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
            <h2><FiMonitor /> Monitor Output</h2>
        </header>
        <div className={styles.outputContainer}>
          <pre className={styles.output}>
            {data || <div className={styles.placeholder}>Not connected...</div>}
          </pre>
        </div>
      </main>
    </div>
  );
};

export default MonitorPage;
