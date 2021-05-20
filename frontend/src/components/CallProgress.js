import React from "react";
import { Container, Step } from "semantic-ui-react";
import socket from "../utils/SocketIo";

function CallProgress({ call: { CallSid } }) {
  function answerCall(sid) {
    socket.client.emit("answer-call", { sid });
  }

  return (
    <Container>
      <Step.Group fluid>
        <Step
          icon="phone"
          title="Ringing"
          description={CallSid.CallSid}
          active={CallSid.CallStatus === "ringing"}
          completed={CallSid.CallStatus !== "ringing"}
        />
        <Step
          icon="cogs"
          title="In queue"
          description="User waiting in queue"
          active={CallSid.CallStatus === "enqueue"}
          disabled={CallSid.CallStatus === "ringing"}
          onClick={() => answerCall(CallSid.CallSid)}
        />
        <Step
          icon="headphones"
          title="Answered"
          description="Answer by John"
          disabled={
            CallSid.CallStatus === "ringing" || CallSid.CallStatus === "enqueue"
          }
        />
        <Step icon="times" title="Hang up" description="Missed call" />
      </Step.Group>
    </Container>
  );
}

export default CallProgress;
