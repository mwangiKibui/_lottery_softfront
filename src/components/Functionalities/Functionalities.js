import React from 'react';
import './Functionalities.css';

const Functionalities = () => {
    return (
        <div id="features" className="features">
            <h2>Fonctionnalités</h2>
            <div className="feature-cards">
            <div className="card">
                <i className="fas fa-users"></i>
                <h3>Gestion des Vendeurs</h3>
                <p>Enregistrez et gérez les vendeurs sans effort.</p>
            </div>
            <div className="card">
                <i className="fas fa-chart-line"></i>
                <h3>Suivi des ventes</h3>
                <p>Suivez les activités et les ventes des vendeurs en temps réel.</p>
            </div>
            <div className="card">
                <i className="fas fa-trophy"></i>
                <h3>Numéros gagnants</h3>
                <p>Affichez instantanément les numéros et les billets gagnants.</p>
            </div>
            <div className="card">
                <i className="fa fa-ban" aria-hidden="true"></i>
                <h3>Limite de Vente</h3>
                <p>Limitez le montant de vente de chaque jeu par tirage et bloquez les numéros que vous ne voulez pas vendre</p>
            </div>
            <div className="card">
                <i className="fa fa-ticket" aria-hidden="true"></i>
                <h3>Raport de Vente</h3>
                <p>Voyez le raport de vente de vos vendeurs par jour et par Période</p>
            </div>
            <div className="card">
                <i className="fa fa-usd" aria-hidden="true"></i>
                <h3>Condition de paiement</h3>
                <p>Definissez vos conditions de paiement par tirage</p>
            </div>
            </div>
        </div>
    )
};

export default Functionalities;