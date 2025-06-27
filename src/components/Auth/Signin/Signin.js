import React from 'react';
import PropTypes from 'prop-types';
import {Link as RouterLink} from 'react-router-dom';
import './Signin.css';


const SigninComponent = (props) => {
    return (
        <div className="login-container">
        <form className="login-form" onSubmit={props.handleSubmit}>
            <h2>Login</h2>

           
            <div class="input-group">
                <input type="text" id="username" name="username" required value={props.name} onChange={e => props.setName(e.target.value)}/>
                <label htmlFor="username">Username</label>
            </div>

            
            <div className="input-group">
                <input type="password" id="password" name="password" required value={props.password} onChange={e => props.setPassword(e.target.value)}/>
                <label htmlFor="password">Password</label>
            </div>

           
            <div className="options">
                <label>
                    <input type="checkbox" name="remember" /> Remember Me
                </label>
                <RouterLink to="#">Forgot Password?</RouterLink>
            </div>

            
            <button type="submit" className='login-submit-button'>Sign In</button>

           
            <p className="signup-link">Don't have an account? <RouterLink to="#">Sign Up</RouterLink></p>
        </form>
    </div>
    )
};

SigninComponent.propTypes = {
    name: PropTypes.string,
    setName: PropTypes.func,
    password: PropTypes.string,
    setPassword: PropTypes.func,
    handleSubmit: PropTypes.func,
};

export default SigninComponent;