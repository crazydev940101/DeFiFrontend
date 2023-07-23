/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import ToggleButton from 'react-toggle-button';

import {
    Card, CardBody, CardHeader, CardFooter, Col, CardText, Row, Button, Form, FormGroup, Input
} from "reactstrap";
import "./socketpanel.css";

function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}
const SocketPanel = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const { showNotify } = props;
    const [is_start_socket, setIsStartSocket] = useState(false);
    const [is_start_simulation, setIsStartSimulation] = useState(false);
    const [interval, setInterval] = useState(10);
    const borderRadiusStyle = { borderRadius: 2 };

    useEffect(() => {
        /**
        *    get state of start_simulation_button 
        */
        // setLoading(true);
        async function getIsStartSimulation() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName
                };
                const response = await ApiCall(
                    apiConfig.get_simulate.url,
                    apiConfig.get_simulate.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.status === 200) {
                    if (isMounted()) {
                        if (!response.data.simulate) {
                            setIsStartSimulation(false);
                        } else {
                            setIsStartSimulation(response.data.simulate);
                        }
                        setInterval(response.data.watch_interval);
                    }
                }
            } catch (error) {
                // setLoading(false);
            }
        }
        getIsStartSimulation();
    }, [props.credential.loginToken]);

    /**
     *    switch socket to on/off
     */
    const onSocketSwitch = async (value) => {
        setIsStartSocket(!value);
    }

    /**
     *    
     */
    const onSimulationSwitch = async (value) => {
        setIsStartSimulation(!value);
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                simulate: !value
            };
            const response = await ApiCall(
                apiConfig.change_simulate.url,
                apiConfig.change_simulate.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, 'success');
            }
        } catch (error) {
            showNotify('Failed to do simulation.', 'danger');
        }
    }

    /**
     *      stop watch to do socket for price
     */
    const onHandleStop = async () => {
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
            };
            const response = await ApiCall(
                apiConfig.close_watcher.url,
                apiConfig.close_watcher.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, 'success');
            }
        } catch (error) {
            showNotify('Failed to stop watch price.', 'danger');
        }
    }

    const onSetInterval = async(e) => {
        e.preventDefault();
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                watch_interval: interval
            };
            const response = await ApiCall(
                apiConfig.set_watch_interval.url,
                apiConfig.set_watch_interval.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, 'success');
            }
        } catch (error) {
            showNotify('Failed to stop watch price.', 'danger');
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Other</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col className="pr-md-1 toggle_botton" md="2">
                            <CardText>Socket Setting</CardText>
                            <ToggleButton
                                inactiveLabel={'OFF'}
                                activeLabel={'ON'}
                                colors={{
                                    activeThumb: {
                                        base: 'rgb(250,250,250)',
                                    },
                                    inactiveThumb: {
                                        base: 'rgb(250,250,250)',
                                    },
                                    active: {
                                        base: 'rgb(20,168,0)',
                                        hover: 'rgb(20,168,0)',
                                    },
                                    inactive: {
                                        base: 'rgb(65,66,68)',
                                        hover: 'rgb(95,96,98)',
                                    }
                                }}
                                value={is_start_socket}
                                thumbAnimateRange={[1, 57]}
                                thumbStyle={borderRadiusStyle}
                                trackStyle={borderRadiusStyle}
                                onToggle={(value) => onSocketSwitch(value)} />
                            * click here to start *
                        </Col>
                        <Col className="pr-md-1 toggle_botton" md="2">
                            <CardText>Simulation Setting</CardText>
                            <ToggleButton
                                inactiveLabel={'OFF'}
                                activeLabel={'ON'}
                                colors={{
                                    activeThumb: {
                                        base: 'rgb(250,250,250)',
                                    },
                                    inactiveThumb: {
                                        base: 'rgb(250,250,250)',
                                    },
                                    active: {
                                        base: 'rgb(20,168,0)',
                                        hover: 'rgb(20,168,0)',
                                    },
                                    inactive: {
                                        base: 'rgb(65,66,68)',
                                        hover: 'rgb(95,96,98)',
                                    }
                                }}
                                value={is_start_simulation}
                                thumbAnimateRange={[1, 57]}
                                thumbStyle={borderRadiusStyle}
                                trackStyle={borderRadiusStyle}
                                onToggle={(value) => onSimulationSwitch(value)} />
                            * click here to start *
                        </Col>
                    </Row>
                    <hr size="5" width="100%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                    <Row>
                        <Col className="pr-md-1 toggle_botton" md="2">
                            <CardText>Close Watcher</CardText>
                            <Button onClick={onHandleStop} className="btn1" color="btn1" type="submit" >
                                Stop Watch
                            </Button>
                        </Col>
                        <Col className="pr-md-1" md="1">
                            <Form>
                            <FormGroup>
                                <CardText style={{textAlign: "right"}}>Set Watch</CardText>
                                <Input type="number" style={{marginTop: "12px"}} value={interval} onChange={(e) => setInterval(e.target.value)} />
                            </FormGroup>
                            </Form>
                        </Col>
                        <Col className="pr-md-1" md="4">
                            <CardText>to click here</CardText>
                            <Button onClick={onSetInterval} className="btn1" color="btn1" type="submit" >
                                Set Watch
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                </CardFooter>
            </Card>
        </>
    )
}

export default SocketPanel