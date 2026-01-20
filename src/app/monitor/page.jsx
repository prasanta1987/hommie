'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { FiHardDrive, FiZap, FiXCircle, FiPlus, FiSettings, FiMonitor, FiAlertTriangle, FiSend } from 'react-icons/fi';
import styles from './monitor.module.css';

const MonitorPage = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [port, setPort] = useState(null);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [baudRate, setBaudRate] = useState(9600);
  const [data, setData] = useState('');
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  const [inputData, setInputData] = useState('');

  const disconnectFromSerial = useCallback(async () => {
    if (reader) {
      await reader.cancel().catch(() => {});
      setReader(null);
    }
    if (writer) {
      writer.releaseLock();
      setWriter(null);
    }
    if (port) {
      await port.close().catch(() => {});
      setPort(null);
    }
    setData('');
  }, [port, reader, writer]);

  useEffect(() => {
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
    
    const handlePortChange = () => getPorts();

    navigator.serial?.addEventListener('connect', handlePortChange);
    navigator.serial?.addEventListener('disconnect', handlePortChange);
    getPorts();

    return () => {
      navigator.serial?.removeEventListener('connect', handlePortChange);
      navigator.serial?.removeEventListener('disconnect', handlePortChange);
    };
  }, []);

  useEffect(() => {
    if (availablePorts.length > 0 && !port) {
      const newPortStillAvailable = availablePorts.some(p => p === selectedPort);
      if (!newPortStillAvailable) {
        setSelectedPort(availablePorts[0]);
      }
    } else if (availablePorts.length === 0) {
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
      const writer = selectedPort.writable.getWriter();
      setWriter(writer);
    } catch (error) {
      console.error(`Error connecting to serial port: ${error.message}`);
    }
  };

  const readData = async (serialPort) => {
    const textDecoder = new TextDecoderStream();
    serialPort.readable.pipeTo(textDecoder.writable);
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

  const handleSendData = async (e) => {
    e.preventDefault();
    if (writer && inputData) {
      const encoder = new TextEncoder();
      try {
        await writer.write(encoder.encode(inputData + '\n'));
        setData(prevData => prevData + `> ${inputData}\n`);
        setInputData('');
      } catch (error) {
        console.error('Error writing to serial port:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (port) {
        disconnectFromSerial();
      }
    };
  }, [port, disconnectFromSerial]);

  if (!isSupported) {
    return (
      <div className={styles.unsupportedContainer}>
        <FiAlertTriangle size={60} color="#e53e3e" />
        <h2>Web Serial API Not Supported</h2>
        <p>Your browser does not support the Web Serial API.</p>
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
              <Form.Select id="port-select" className={styles.select}
                onChange={(e) => setSelectedPort(availablePorts[e.target.value])}
                value={selectedPort ? availablePorts.indexOf(selectedPort) : ''}
                disabled={!!port || availablePorts.length === 0}>
                <option value="" disabled>Select a port</option>
                {availablePorts.map((p, i) => {
                  const info = p.getInfo();
                  const vid = info.usbVendorId ? `0x${info.usbVendorId.toString(16)}` : null;
                  const pid = info.usbProductId ? `0x${info.usbProductId.toString(16)}` : null;
                  return (
                    <option key={i} value={i}>
                      {vid ? `USB (${vid}:${pid})` : `Port ${i + 1}`}
                    </option>
                  );
                })}
              </Form.Select>
              <button title="Request New Port" className={`${styles.button} ${styles.secondaryButton}`} onClick={requestPort} disabled={!!port}>
                <FiPlus />
              </button>
            </div>
          </div>
          <div className={styles.controlGroup}>
            <label htmlFor="baud-rate-select">Baud Rate</label>
            <Form.Select id="baud-rate-select" className={styles.select} value={baudRate}
              onChange={(e) => setBaudRate(parseInt(e.target.value))} disabled={!!port}>
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
        <div className={styles.inputArea}>
          <form onSubmit={handleSendData} className={styles.inputForm}>
            <input type="text" className={styles.sendInput}
              value={inputData} onChange={(e) => setInputData(e.target.value)}
              placeholder={port ? "Type data to send and press Enter" : "Connect to a port to send data"}
              disabled={!port} />
            <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={!port || !inputData}>
              <FiSend />
              <span>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MonitorPage;
