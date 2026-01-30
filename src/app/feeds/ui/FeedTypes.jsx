'use client'
import { Modal, Button, Form } from 'react-bootstrap';

export default function FeedTypes({ feedType, setFeedType }) {
    return (
        <div className="d-flex flex-row justify-content-between">

            <div className="form-check">
                <input
                    type="radio"
                    className="form-check-input"
                    id="card-type"
                    label="Card"
                    value="Card"
                    checked={feedType === 'Card'}
                    onChange={(e) => setFeedType(e.target.value)}
                />
                <label title="" htmlFor="card-type" className="form-check-label">Card</label>
            </div>
            
            <div className="form-check">
                <input
                    id="gauge-type"
                    className="form-check-input"
                    type="radio"
                    value="Gauge"
                    checked={feedType === 'Gauge'}
                    onChange={(e) => setFeedType(e.target.value)}
                />
                <label title="" htmlFor="gauge-type" className="form-check-label">Gauge</label>
            </div>

            <div className="form-check">
                <input
                    type="radio"
                    className="form-check-input"
                    id="slider-type"
                    label="Slider"
                    value="Slider"
                    checked={feedType === 'Slider'}
                    onChange={(e) => setFeedType(e.target.value)}
                />
                <label title="" htmlFor="slider-type" className="form-check-label">Slider</label>
            </div>

            <div className="form-check">
                <input
                    type="radio"
                    id="toggle-type"
                    className="form-check-input"
                    label="Toggle"
                    value="Toggle"
                    checked={feedType === 'Toggle'}
                    onChange={(e) => setFeedType(e.target.value)}
                />
                <label title="" htmlFor="toggle-type" className="form-check-label">Toggle</label>
            </div>

        </div>
    );
}
