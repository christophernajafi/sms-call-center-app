import React from "react";
import { Grid, Header, Form, Segment, Button } from "semantic-ui-react";

function Login({
  user: { username, mobileNumber, verificationCode, verificationSent },
  setUser,
  sendSmsCode,
  sendVerificationCode,
}) {
  const populateFields = (event, data) => {
    setUser((draft) => {
      draft[data.name] = data.value;
    });
  };

  const onChange = (event, data) => populateFields(event, data);

  return (
    <Grid textAlign="center" verticalAlign="middle" style={{ height: "100vh" }}>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Login to Your Account
        </Header>
        <Form>
          <Segment stacked>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              value={username}
              onChange={onChange}
              name="username"
            />
            <Form.Input
              fluid
              icon="mobile alternate"
              iconPosition="left"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={onChange}
              name="mobileNumber"
            />
            {verificationSent && (
              <Form.Input
                fluid
                icon="key"
                iconPosition="left"
                placeholder="Enter Verification Code"
                value={verificationCode}
                onChange={onChange}
                name="verificationCode"
              />
            )}
            <Button
              color="teal"
              fluid
              size="large"
              onClick={!verificationSent ? sendSmsCode : sendVerificationCode}
            >
              {!verificationSent ? "Login/Signup" : "Send Verification Code"}
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
}

export default Login;
