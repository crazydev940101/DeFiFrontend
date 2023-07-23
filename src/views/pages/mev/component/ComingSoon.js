/**
 *  Updated by Dragonslayer 5/27/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Row,
    Col,
} from "reactstrap";
import ComingSoonComponent from "../../../../views/components/ComingSoon";



function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}
const ComingSoon = (props) => {
    const { showNotify } = props;
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;

    useEffect(() => {

    }, []);


    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Mev Bot</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col className="pr-md-1 clock-center" md="12">
                            <ComingSoonComponent />
                        </Col>

                    </Row>
                </CardBody>
                <CardFooter>

                </CardFooter>
            </Card>
        </>
    );
};

export default ComingSoon;