import React, { Fragment } from "react";
import CallProgress from "./CallProgress";
import NavBar from "./NavBar";

const CallCenter = ({ calls }) => {
  return (
    <Fragment>
      <NavBar />
      {calls.calls.map((call) => (
        <CallProgress key={call.CallSid.CallSid} call={call} />
      ))}
    </Fragment>
  );
};

export default CallCenter;
