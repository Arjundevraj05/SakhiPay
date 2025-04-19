import React from 'react';
import CountUp from 'react-countup';
import { BiFemale, BiTransfer, BiMap, BiWorld } from 'react-icons/bi';
import '../styles/stats.css';

const Stats = () => {
    return (
        <section className="stats">
            <div className="stat-item">
                <BiFemale className="stat-icon" />
                <h2>
                    <CountUp end={50000} duration={2.5} separator="," />+
                </h2>
                <p>Women Empowered</p>
            </div>
            <div className="stat-item">
                <BiTransfer className="stat-icon" />
                <h2>
                    <CountUp end={1000000} duration={2.5} separator="," />+
                </h2>
                <p>UPI Transactions Processed</p>
            </div>
            <div className="stat-item">
                <BiMap className="stat-icon" />
                <h2>
                    <CountUp end={500} duration={2.5} separator="," />+
                </h2>
                <p>Villages Reached</p>
            </div>
            <div className="stat-item">
                <BiWorld className="stat-icon" />
                <h2>
                    <CountUp end={10} duration={2} />+
                </h2>
                <p>Languages Supported</p>
            </div>
        </section>
    );
};

export default Stats;
