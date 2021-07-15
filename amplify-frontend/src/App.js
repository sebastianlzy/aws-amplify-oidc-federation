// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {useEffect, useState, Fragment} from "react";
import Amplify, {Auth, Hub} from "aws-amplify";
import {Container} from "react-bootstrap";

import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";
import amplifyConfig from './amplify-config.json'

Amplify.configure(amplifyConfig)
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

// Amplify.configure({
//   Auth: {
//     region: "<enter the region here>",
//     userPoolId: "<enter the cognito user pool id here>",
//     userPoolWebClientId: "<enter the applicaiton client id>",
//     oauth: {
//       domain: "<enter here the amazon cognito domain>",
//       scope: ["email", "openid", "aws.cognito.signin.user.admin", "profile"],
//       redirectSignIn: "<enter here the amplify hosted url>",
//       redirectSignOut: "<enter here the amplify hosted url>",
//       responseType: "code"
//     }
//   }
// });

const federatedIdName =
  "okta-idp-provider-name";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
