import React from "react";
import {Link as RouterLink } from "react-router-dom";
import './PricingPlan.css';

const PricingPlan = () => {
    return (
        <div className="pricing">
            <h2>Plans tarifaires abordables</h2>
            <div className="pricing-cards">
            <div className="card">
                <h3>Première étape de prix</h3>
                <p className="price">$10/mois</p>
                <ul>
                <li>1- De 1 à 39 appareils connectés</li>
                <li>2- Pas de personalistion</li>
                <li>3- Enregisterment gratuit</li>
                </ul>
                <RouterLink to="#" className="btn-get-started">Get Started</RouterLink>
            </div>
            <div className="card">
                <h3>Deuxième étape de prix</h3>
                <p className="price">$9/mois</p>
                <ul>
                <li>1- De 40 à 80 appareils connectés</li>
                <li>2- Personalistion gratuite</li>
                <li>3- Dépannage d'appareil gratuit</li>
                </ul>
                <RouterLink to="#" className="btn-get-started">Get Started</RouterLink>
            </div>
            <div className="card">
                <h3>Troisième étape de prix</h3>
                <p className="price">A négocier</p>
                <ul>
                <li>Custom Features</li>
                <li>Dedicated Support</li>
                <li>API Access</li>
                </ul>
                <RouterLink to="#" className="btn-get-started">Contact Us</RouterLink>
            </div>
            </div>
        </div>
    )
};

export default PricingPlan;