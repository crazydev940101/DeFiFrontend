/**
 *  Updated by Dragonslayer 6/8/2023
 */

import React, { useState, useEffect, useCallback } from "react";
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Row,
    Col,
} from "reactstrap";
import Timer from '../../../components/Timer.js';
import "./blockpanel.css";


const BlockPanel = (props) => {
    const [blockID, setBlockID] = useState('');
    const [color, setColor] = useState('black');
    const socket = props.socket;

    const blockNumberCallback = useCallback(data => {
        setBlockID(data);
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setColor(randomColor);
    })
    useEffect(() => {
        if (socket) {
            socket.on("test:blocknumber", blockNumberCallback);
            return () => {
                if (socket) {
                    socket.off("test:blocknumber", blockNumberCallback);
                }
            };
        }
    }, [socket]);


    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Block Number Test</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col className="pr-md-1 clock-center" md="12">
                            <Timer />
                            <p style={{ color: color, fontSize: "20px", textAlign: "center" }}>{blockID ? blockID : 'Block Number: ________ , Transaction count: ___'}</p>
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                </CardFooter>
            </Card>
        </>
    );
};


export default BlockPanel;