import React,{useState} from 'react';
import PropTypes from 'prop-types';
import {Link as RouterLinkScroll } from "react-scroll";
import {Link as RouterLink} from 'react-router-dom';
import './CustomNavbar.css';

const CustomNavbar = (props) => {

    const [showMenuOnMobile,setShowMenuOnMobile] = useState(false);
   

    return (
        <div className="header">
            <nav className="navbar">

                

                <div className="navdiv">
                
                    <div className="logoContainer">
                    <div className="toggle-btn" >
                    <i className="fas fa-bars" onClick={e => setShowMenuOnMobile(!showMenuOnMobile)}></i>
                </div>
                        <div className="companyName">
                            <RouterLink to={props.navbarBrandUrl}>
                                {props.navbarBrand}
                            </RouterLink>
                        </div>
                </div>

                {/* <div className="nav-menus"> */}
                    <ul className='centerLinks' style={{"display":showMenuOnMobile == true ? "block" : "none"}}>
                        
                        {
                            props.centerLinks && props.centerLinks.length > 0 && props.centerLinks.map((link, index) => {
                                return (
                                    link.redirect ? (
                                        <li key={index}>
                                            <RouterLink to={link.url}>{link.text}</RouterLink>
                                        </li>
                                    ) : (
                                    <li key={index}>
                                        <RouterLinkScroll scroll to={link.url} smooth={true}  offset={-50}  className="nav-link">
                                            
                                            {link.text}
                                        
                                    </RouterLinkScroll>
                                    </li>
                                        
                                ))
                            })
                        }
                    </ul>

                    {/* <ul className='rightLinks'> */}
                        {
                            props.rightLinks && props.rightLinks.length > 0 && props.rightLinks.map((link,index) => {
                                return (
                                    <button key={index} type="button" className="nav-link-btn">
                                        <RouterLink to={link.url}>
                                            
                                                {link.text}
                                        
                                        </RouterLink>
                                </button>
                            )
                            })
                        }
                    {/* </ul> */}
                {/* </div> */}

                
                
                
                </div>
            </nav>
        </div>
    );
}

CustomNavbar.propTypes = {
    centerLinks: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    })),
    rightLinks: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    })),
    navbarBrand: PropTypes.string.isRequired,
    navbarBrandUrl: PropTypes.string.isRequired,
  };
  

export default CustomNavbar;