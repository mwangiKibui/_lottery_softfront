import React from 'react';
import {Link as RouterLink } from "react-router-dom";
import './Hero.css';

const HeroSection = () => {
    return (
        <div id="home" className="hero">
            <div className="hero-content">
            <h1>Révolutionnez la gestion de votre entreprise de loterie</h1>
            <p>Gérez les vendeurs, suivez les ventes et optimisez votre activité de loterie sans effort.</p>
            <div className="hero-buttons">
                <RouterLink to="#" className="btn-get-started-1">Get Started</RouterLink>
                <RouterLink to="#" className="btn-view-demo">View Demo</RouterLink>
            </div>
            </div>
        </div>
    )
};


export default HeroSection;