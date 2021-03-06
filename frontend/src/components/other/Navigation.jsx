import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import {Route, Redirect, Switch} from 'react-router-dom'

import Navbar from "./Navbar";
import Home from "./Home";
import UserHome from "../user/UserHome";
import SignIn from "./SignIn";
import ReservationScreen from "../user/ReservationScreen";

class Navigation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            auth: false,
            tables: [],
            reservation: null,
            user: null
        };
        this.updateAuth = this.updateAuth.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.getTables = this.getTables.bind(this);
        this.getReservations = this.getReservations.bind(this);
        this.makeReservation = this.makeReservation.bind(this);
        this.cancelReservation = this.cancelReservation.bind(this);
        this.handleUser = this.handleUser.bind(this);
    }

    /**
     * Method that updates the current session state
     * @param auth contains whether the user is authenticated or not
     */
    updateAuth(auth) {
        this.setState({auth: auth});
    }

    /**
     * Method to log out the user
     */
    handleLogout = () => {
        let cookies = new Cookies();
        cookies.remove("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        this.setState({auth: false, user: null});
    };

    /**
     * Method that gets all available tables
     */
    getTables() {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        let config = {
            headers: {'Authorization': 'Bearer ' + token}
        };
        axios.get('/API/tables', config)
            .then((res) => {
                return res.data;
            })
            .then((data) => {
                this.setState({tables: data})
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Method that gets all available tables
     */
    getReservations() {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        let config = {
            headers: {'Authorization': 'Bearer ' + token}
        };
        axios.get('/API/reservations', config)
            .then((res) => {
                return res.data;
            })
            .then((data) => {
                this.setState({reservation: data})
            })
            .catch((err) => {
                console.log(err);
            });
    }

    makeReservation(tableId, rProps) {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        console.log(token);
        if (token) {
            let config = {
                headers: {'Authorization': 'Bearer ' + token}
            };
            axios.post(`/API/reservation/table/${tableId}`, {}, config)
                .then((res) => {
                    return res.data;
                })
                .then((res) => {
                    this.setState({
                        reservation: res.reservation
                    }, () => {
                        rProps.history.push('/reservation')
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    cancelReservation(rProps) {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        if (token) {
            let config = {
                headers: {'Authorization': 'Bearer ' + token}
            };
            axios.delete(`/API/reservation/${this.state.reservation._id}`, config)
                .then((res) => {
                    this.setState({reservation: undefined});
                    rProps.history.push('/')
                })
                .catch((err) => {
                    console.log(err);
                })
        }

    }

    componentWillMount() {
        this.handleUser();
    }

    handleUser() {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        if (token) {
            let config = {
                headers: {'Authorization': 'Bearer ' + token}
            };
            axios.get('/API/getUser', config)
                .then((res) => {
                    return res.data;
                })
                .then((data) => {
                    this.setState({
                        user: {
                            name: data.name,
                            lastname: data.lastname,
                            email: data.email,
                            _id: data._id,
                        },
                        auth: true
                    }, () => {
                        this.getTables();
                        this.getReservations();
                    });

                })
                .catch((err) => {
                    console.log(err);
                    cookies.remove("COMUNIAPP_TOKEN_COOKIE");
                    this.setState({
                        auth: false,
                        contests: [],
                        user: null
                    });
                });
        }
    }

    render() {
        let reservationTable = undefined;
        if (this.state.tables) {
            reservationTable = this.state.tables.filter((t) => {
                return (this.state.reservation && this.state.reservation.TABLE_ID === t.TABLE_ID);
            });
        }
        return (
            <div id="navigation">
                <Navbar auth={this.state.auth} logout={this.handleLogout}/>
                <div className="content">
                    <Switch>
                        <Route exact path="/" render={(rProps) => this.state.auth ?
                            <UserHome tables={this.state.tables} reservation={this.state.reservation}
                                      cancelReservation={this.cancelReservation} rProps={rProps}
                                      makeReservation={this.makeReservation}/>
                            : <Home/>
                        }/>
                        <Route exact path="/login"
                               render={() => (this.state.auth ? <Redirect to='/'/> :
                                   <SignIn isSignup={false} handleUser={this.handleUser} updateAuth={this.updateAuth}
                                           getTables={this.getTables}/>)}/>
                        <Route exact path="/signup"
                               render={() => (this.state.auth ? <Redirect to='/'/> :
                                   <SignIn isSignup={true} handleUser={this.handleUser} updateAuth={this.updateAuth}
                                           getTables={this.getTables}/>)}/>
                        <Route exact path="/reservation"
                               render={(rProps) => (this.state.auth ?
                                   <ReservationScreen cancelReservation={this.cancelReservation} rProps={rProps}
                                                      reservation={this.state.reservation} user={this.state.user}
                                                      table={reservationTable[0]}/> :
                                   <Redirect to='/'/>)}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default Navigation