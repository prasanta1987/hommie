'use client'
import Link from 'next/link';
import { FiCpu, FiRss, FiArrowRight } from 'react-icons/fi';
import './Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to Hommie</h1>
        <p className="hero-subtitle">
          Your central hub for monitoring real-time data feeds from your IoT devices and microcontrollers like ESP boards.
        </p>
        <Link href="/feeds" className="cta-button">
          Go to Your Feeds <FiArrowRight className="cta-icon" />
        </Link>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <FiCpu size={50} className="feature-icon" />
          <h2 className="feature-title">MCU Integration</h2>
          <p className="feature-description">
            Seamlessly connect to your ESP32, ESP8266, and other microcontrollers.
          </p>
        </div>
        <div className="feature-card">
          <FiRss size={50} className="feature-icon" />
          <h2 className="feature-title">Real-Time Feeds</h2>
          <p className="feature-description">
            View live data streams from your sensors and devices directly in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
