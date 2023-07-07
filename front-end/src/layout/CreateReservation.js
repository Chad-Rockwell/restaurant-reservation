import React from "react";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useEffect } from "react";

function CreateReservation() {
    const numbers = Array.from({ length: 20 }, (_, index) => index + 1);
    const history = useHistory();
    const goBack = (event) => {
        event.preventDefault();
        history.goBack();
      };
  return (
    <form>
      <label htmlFor="first_name">First name</label>
      <input
        type="text"
        id="first_name"
        name="first_name"
        placeholder="First name"
      ></input>
      <label htmlFor="last_name">Last name</label>
      <input
        type="text"
        id="last_name"
        name="last_name"
        placeholder="Last name"
      ></input>
      <label htmlFor="mobile_number">Mobile number</label>
      <input
        type="text"
        id="mobile_number"
        name="mobile_number"
        placeholder="Mobile number"
      ></input>
      <label htmlFor="reservation_date">Date of reservation</label>
      <input type="date" id="reservation_date" name="reservation_date"></input>
      <label htmlFor="reservation_time">Time of reservation</label>
      <input type="time" id="reservation_time" name="reservation_time"></input>
      <label htmlFor="people">Party size:</label>
      <select id="people" name="people">
        {numbers.map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select>
      <button onClick={goBack}>
        Cancel
      </button>
      <button type="submit">
        Submit
      </button>
    </form>
  );
}

export default CreateReservation;
