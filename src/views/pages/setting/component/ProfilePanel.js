/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useState, } from "react";

import {
    Button, Card, CardBody, CardHeader, CardFooter, Col, Form, FormGroup, Input, Row
} from "reactstrap";
import "./profilepanel.css";

const ProfilePanel = (props) => {
    const { apiConfig, ApiCall } = global;
    const { showNotify } = props;
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /**
    *    change your password
    */
    const onChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword == "") {
            showNotify('Please input new password.', 'danger');
            return;
        } else if (newPassword != confirmPassword) {
            showNotify('Passwords are not matched.', 'danger');
            return;
        }
        try {
            const payLoad = {
                password,
                newPassword,
                _id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.changePassword.url,
                apiConfig.changePassword.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, 'success');
            } else {
                showNotify('Failed in changing password.', 'danger');
            }
        } catch (error) {
            showNotify('Failed in changing password.', 'danger');
        }
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Edit Profile</h5>
                </CardHeader>
                <CardBody>
                    <Form>
                        <Row>
                            <Col className="pr-md-1" md="7">
                                <FormGroup>
                                    <label>Old Password</label>
                                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="7">
                                <FormGroup>
                                    <label>New Password</label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="7">
                                <FormGroup>
                                    <label>Confirm Password</label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
                <CardFooter>
                    <Button className="btn-fill" color="green" type="submit" onClick={onChangePassword}>
                        Save
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

export default ProfilePanel