import CustomStats from 'components/CustomStats/CustomStats';
import MainMenuLinks from 'components/MainMenuLinks/MainMenuLinks';
import React from 'react';
import PropTypes from 'prop-types';

const CustomMainMenu = ({menuLinks,adminMenus}) => {
    return (
       <>
        <MainMenuLinks links={menuLinks} adminMenus={adminMenus}/>
       </>
    )
};

CustomMainMenu.propTypes = {
  menuLinks:  PropTypes.arrayOf(PropTypes.object),
  adminMenus: PropTypes.bool
}

CustomMainMenu.defaultProps = {
  adminMenus: false
}

export default CustomMainMenu;