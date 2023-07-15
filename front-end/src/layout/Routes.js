import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import CreateReservation from "../components/reservations/CreateReservation";
import SeatReservation from "../components/reservations/SeatReservation";
import CreateTable from "../components/tables/CreateTable";
import Search from "../components/search/Search"
import EditReservation from "../components/reservations/EditReservation"
import NotFound from "./NotFound";
import { today } from "../utils/date-time";


/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"}/>
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"}/>
      </Route>
      <Route exact={true} path="/reservations/new">
        <CreateReservation/>
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation/>
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservation/>
      </Route>
      <Route path="/tables/new">
        <CreateTable/>
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()}/>
      </Route>
      <Route path="/search">
        <Search/>
      </Route>
      <Route>
        <NotFound/>
      </Route>
    </Switch>
  );
}

export default Routes;