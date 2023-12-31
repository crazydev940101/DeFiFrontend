import React, { useEffect } from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useHistory } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import './login.css';
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
} from "reactstrap";

const Login = ({ credential, LoginSuccess, LogOutSuccess }) => {
  const [state, setState] = React.useState({ email: '', password: '' });
  const history = useHistory();
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = React.useRef(null);

  const notify = (message, type) => {
    let options = {};
    options = {
      place: "tr",
      message: message,
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 2,
    };
    if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options);
  };
  const submit = async () => {
    if (!state.email) {
      notify("Please input your email", 'danger');
      return;
    }
    if (!state.password) {
      notify("Please input password", 'danger');
      return;
    }
    try {
      const payLoad = {
        email: state.email,
        password: state.password,
      };
      const response = await ApiCall(
        apiConfig.authenticate.url,
        apiConfig.authenticate.method,
        "",
        payLoad
      );
      LoginSuccess(response.data);
    } catch (error) {
      if (error.response) {
        notify(error.response.data.message, 'danger');
      }
      else if (error.request) {
        // client never received a response, or request never left
        notify("Request has been failed", '', 'danger');
      }
      else {
        notify("Something went wrong", '', 'danger');
      }
      LogOutSuccess();
    }
  };
  React.useEffect(() => {
    document.body.classList.toggle("login-page");
    return function cleanup() {
      document.body.classList.toggle("login-page");
    };
  });
  useEffect(() => {
    if (credential && credential.loginToken) {
      history.push("/");
    }
  }, [credential]);
  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Container>
          <Col className="ml-auto mr-auto" lg="4" md="6">
            <Form className="form">
              <Card className="card-login card-white">
                <CardHeader>
                  <CardTitle tag="h1">Log in to Hello</CardTitle>
                </CardHeader>
                <CardBody>
                  <InputGroup
                    className={classnames({
                      "input-group-focus": state.emailFocus,
                    })}
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="tim-icons icon-email-85" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="email"
                      type="text"
                      onFocus={(e) => setState({ ...state, emailFocus: true })}
                      onBlur={(e) => setState({ ...state, emailFocus: false })}
                      value={state.email}
                      onChange={(e) => setState({ ...state, email: e.target.value })}
                    />
                  </InputGroup>
                  <InputGroup
                    className={classnames({
                      "input-group-focus": state.passwordFocus,
                    })}
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="tim-icons icon-key-25" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="password"
                      type="password"
                      onFocus={(e) => setState({ ...state, passwordFocus: true })}
                      onBlur={(e) => setState({ ...state, passwordFocus: false })}
                      value={state.password}
                      onChange={(e) => setState({ ...state, password: e.target.value })}
                    />
                  </InputGroup>
                </CardBody>
                <CardFooter>
                  <a href="/auth/register" className="registerA">Go to register</a>
                  <Button
                    block
                    className="mb-3"
                    color="green"
                    onClick={submit}
                    size="lg"
                  >
                    Login
                  </Button>
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Container>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      LogOutSuccess: global.Actions.LoginAction.LogOutSuccess,
      LoginSuccess: global.Actions.LoginAction.LoginSuccess
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);