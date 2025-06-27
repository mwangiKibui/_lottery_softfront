import React from "react";
import {Link as RouterLink } from "react-router-dom";
import './CustomFooter.css';

const CustomFooter = () => {
    const year = 2023;
    return (
        <section id="contact">
            <footer>
                <div className="footer-content">
                <div className="logo">LotterySoft</div>
                <div className="footerP">
                <p className="footerText">POUR CONTACTER LA COMPAGNIE:</p>
                <p className="footerText">COMPOSEZ LE +50933244080</p>
                <p className="footerText">OU ECRIVEZ NOUS A: lotterysoft186@gmail.com</p>
                </div>
                <div className="social-icons">
                    <RouterLink to="#"><i class="fab fa-facebook"></i></RouterLink>
                    <RouterLink to="#"><i class="fab fa-linkedin"></i></RouterLink>
                </div>
                </div>
                <div className="copyright">
                <p>© {year} LotterySoft. All rights reserved.</p>
                </div>
            </footer>
      </section>
    );
}

export default CustomFooter;