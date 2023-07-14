import React, { useState } from "react";
import { createTable } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import { useHistory } from "react-router-dom";

export default function CreateTable() {
  const [tableErrors, setTableErrors] = useState({});
  const history = useHistory();

  const initialTableData = {
    table_name: "",
    capacity: "",
  };

  const [tableData, setTableData] = useState({ ...initialTableData });

  const handleErrorClose = (event) => {
    const errorMessage = event.target.parentNode.parentNode.childNodes[0].innerHTML;
    delete tableErrors[`${errorMessage}`];
    setTableErrors({ ...tableErrors });
  };

  const errorMap = Object.keys(tableErrors).map((error, index) => (
    <ErrorAlert key={`error-${error}`} error={error} handleErrorClose={handleErrorClose} />
  ));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ac = new AbortController();
    tableData.capacity = parseInt(tableData.capacity);
    try {
      await createTable(tableData, ac.signal);
      setTableErrors({});
      history.push(`/dashboard`);
    } catch (error) {
      if (!tableErrors[error.message]) {
        setTableErrors({ ...tableErrors, [error.message]: 1 });
      }
    }
    return () => ac.abort();
  };

  const handleChange = (event) => {
    event.preventDefault();
    setTableData({ ...tableData, [event.target.name]: event.target.value });
  };

  const handleCancel = (event) => {
    event.preventDefault();
    history.go(-1);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_name">
          Table Name:
          <input
            id="table_name"
            name="table_name"
            type="text"
            required
            placeholder="Table Name"
            onChange={handleChange}
            value={tableData.table_name}
          />
        </label>
        <label htmlFor="capacity" style={{marginLeft:"15px"}}>
          Capacity:
          <input
            id="capacity"
            name="capacity"
            type="number"
            required
            min={1}
            onChange={handleChange}
            value={tableData.capacity}
          />
        </label>
        <div>
          <button className="btn btn-outline-dark mr-2" type="submit">
            Submit
          </button>
          <button
            className="btn btn-outline-dark"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}