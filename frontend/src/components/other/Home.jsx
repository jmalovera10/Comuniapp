import React, {Component} from 'react';
import {Link} from "react-router-dom";

export default class Home extends Component{

    render() {
        return(
          <div className="jumbotron">
              <h1 className="display-4">Balneae</h1>
              <p className="lead">Una aplicación para contruir comunidad en Uniandes</p>
              <hr className="my-4"/>
                  <p>Ayudamos a los estudiantes a buscar un espacio para sentarse y hacer nuevos amigos</p>
              <div className="row justify-content-around">
                  <Link to="/signup"><div className="btn btn-success btn-lg" href="#" role="button">Empieza</div></Link>
              </div>
          </div>
        );
    }
}