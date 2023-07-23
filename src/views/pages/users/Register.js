import React from "react";
import classnames from "classnames";
import NotificationAlert from "react-notification-alert";
import './login.css';
import { validateString } from "../../../variables/variable";
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

const Register = () => {
  const [state, setState] = React.useState({ email: '', password: '', passwordConfirm: '' });
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
    if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options)
  };
  const submit = async () => {
    if (!validateString(state.email, 'email')) {
      notify("Please check your email format", 'danger');
      return;
    }
    if (!state.email) {
      notify("Please input your email", 'danger');
      return;
    }
    else if (!state.password) {
      notify("Please input password", 'danger');
      return;
    }
    else if (state.password.length < 6) {
      notify("Password must be at least 6 characters long", 'danger');
      return;
    }
    else if (state.password.length > 50) {
      notify("Password must be at most 50 characters long", 'danger');
      return;
    }
    else if (!state.passwordConfirm) {
      notify("Please check password confirm", 'danger');
      return;
    }
    else if (state.password !== state.passwordConfirm) {
      notify("Password Confirm does not match.", 'danger');
      return;
    }
    const payLoad = {
      email: state.email,
      password: state.password,
      bcrypt: state.email,
      passwordConfirm: state.passwordConfirm,
    };
    try {
      const response = await ApiCall(
        apiConfig.register.url,
        apiConfig.register.method,
        "",
        payLoad
      );
      notify(response.data.message, 'success');
      window.location.href = '/auth/login';
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
    }
  };
  React.useEffect(() => {
    document.body.classList.toggle("login-page");
    return function cleanup() {
      document.body.classList.toggle("login-page");
    };
  });
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
                  {/* <img
                    alt="..."
                    src={require("assets/img/card-primary.png").default}
                  /> */}
                  <CardTitle tag="h1">Register</CardTitle>
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
                  <InputGroup
                    className={classnames({
                      "input-group-focus": state.passwordConfirmFocus,
                    })}
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="tim-icons icon-key-25" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Confirm password"
                      type="password"
                      onFocus={(e) => setState({ ...state, passwordConfirmFocus: true })}
                      onBlur={(e) => setState({ ...state, passwordConfirmFocus: false })}
                      value={state.passwordConfirm}
                      onChange={(e) => setState({ ...state, passwordConfirm: e.target.value })}
                    />
                  </InputGroup>
                </CardBody>
                <CardFooter>
                  <a href="/auth/login" className="registerA">Go to login</a>
                  <Button
                    block
                    className="mb-3"
                    color="green"
                    onClick={submit}
                    size="lg"
                  >
                    Register
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
export default Register;