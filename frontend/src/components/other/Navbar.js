import React, {Component} from 'react';
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';

export default class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <Link to="/">
                    <button className="btn my-2 my-sm-0">Comuniapp</button>
                </Link>

                <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                    <form className="form-inline my-2 my-lg-0">
                        <Link to="/">
                            <button className="btn my-2 my-sm-0">Inicio</button>
                        </Link>
                        {
                            this.props.auth ?
                                null
                                : <Link to="/signup">
                                    <button className="btn btn-outline-success my-2 my-sm-0">Registrarse</button>
                                </Link>
                        }
                        {
                            this.props.auth ?
                                <button className="btn btn-success my-2 my-sm-0" onClick={this.props.logout}>Salir</button>
                                : <Link to="/login">
                                    <button className="btn btn-success my-2 my-sm-0">Iniciar Sesión</button>
                                </Link>
                        }
                    </form>
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    auth: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired
};