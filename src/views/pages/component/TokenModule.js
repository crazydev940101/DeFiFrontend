/**
 *      Created by Dragonslayer 6/23/2023
 */

export const onDetectGas = async (e, key, col, itemList, setItemList, props, showNotify, ApiCall, apiConfig, type) => {
    let tempData = null;
    if (type === 1) tempData = itemList[key];
    else if (type === 2) tempData = itemList[key].tokens[col];

    if (tempData.gas_price == null) {
        showNotify("Please input gas price.", "danger");
        return;
    }
    if (tempData.gas_limit == null) {
        showNotify("Please input gas limit.", "danger");
        return;
    }
    const updateData = [...itemList];
    updateData[key].utils.loading_gas_button = true;
    setItemList(updateData);
    try {
        // itemList[key].user_id = props.credential.loginUserName;
        const payLoad = JSON.parse(JSON.stringify(tempData));
        const response = await ApiCall(
            apiConfig.estimateGas.url,
            apiConfig.estimateGas.method,
            props.credential.loginToken,
            payLoad
        );
        if (response.status === 200) {
            const updateData = [...itemList];
            tempData = {
                ...tempData,
                gas_limit: response.data.maxGasLimit,
                gas_price: response.data.maxFeePerGas,
                slippage: 10
            }

            if (type === 1) {
                updateData[key] = tempData;
            }
            else if (type === 2) {
                updateData[key].tokens[col] = tempData;
            }
            updateData[key].utils.loading_gas_button = false;
            setItemList(updateData);
        }
        //if (response.data.data) setLogData(response.data.data);
    } catch (error) {
        const updateData = [...itemList];
        updateData[key].utils.loading_gas_button = false;
        setItemList(updateData);
        if (error.response && typeof (error.response.data.message) === "string") {
            showNotify(error.response.data.message, 'danger');
        } else {
            showNotify("Something went wrong", 'danger');
        }
    }
};


export const onEstimatePrice = async (e, key, col, itemList, setItemList, props, showNotify, ApiCall, apiConfig, type, onShowChart) => {
    let tempData = null;
    if (type === 1) tempData = itemList[key];
    else if (type === 2) tempData = itemList[key].tokens[col];

    const update = [...itemList];
    update[key].utils.loading_price_button = true;
    setItemList(update);
    try {
        const payLoad = {
            user_id: props.credential.loginUserName,
            owner_address: tempData.owner_address,
            token_address: tempData.token_address,
            token_id: tempData.id,
            follow_id: tempData.follow_id || '',
            type: 1
        };
        const response = await ApiCall(
            apiConfig.estimate_price.url,
            apiConfig.estimate_price.method,
            props.credential.loginToken,
            payLoad
        );
        if (response.status === 200) {
            const updateData = [...itemList];

            tempData.estimationPrice = response.data.estimationPrice;
            if (type === 1) {
                updateData[key] = tempData;
            }
            else if (type === 2) {
                updateData[key].tokens[col] = tempData;
            }
            updateData[key].utils.loading_price_button = false;
            setItemList(updateData);
            onShowChart(e, key, col);
            showNotify("Successfully estimated current price", 'success');
        }
    } catch (error) {
        const updateData = [...itemList];
        updateData[key].utils.loading_price_button = false;
        setItemList(updateData);
        if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
        else showNotify('Something went wrong', 'danger');
    }
};

export const onDetectRugPool = async (value, key, col, itemList, setItemList, props, ApiCall, apiConfig, type, showNotify) => {
    let tempData = null;
    if (type === 1) {
        tempData = itemList[key];
    }
    else if (type === 2) {
        tempData = itemList[key].tokens[col];
    }

    const updated = [...itemList];
    tempData.rug_check = !value;
    if (type === 1) {
        updated[key] = tempData;
    }
    else if (type === 2) {
        updated[key].tokens[col] = tempData;
    }
    setItemList(updated);
    try {
        const payLoad = {
            token_id: tempData._id,
            rug_check: !value,
            user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
            apiConfig.change_rug_check_status.url,
            apiConfig.change_rug_check_status.method,
            props.credential.loginToken,
            payLoad
        );
        if (response.status === 200) {
            showNotify('Successfully set/unset dectect settings', 'success')
        }
    } catch (error) {
        if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
        else showNotify('Something went wrong', 'danger');
    }

};

export const onApproveHandle = async (e, key, col, itemList, setItemList, props, ApiCall, apiConfig, showNotify, setSellButton, type) => {
    let tempData = null;
    if (type === 1) {
        tempData = itemList[key];
    }
    else if (type === 2) {
        tempData = itemList[key].tokens[col];
    }
    const update = [...itemList];
    tempData.isSellDisabled = true;
    if (type === 1) {
        update[key] = tempData;
    }
    else if (type === 2) {
        update[key].tokens[col] = tempData;
    }
    update[key].utils.loading_approve_button = true;
    setItemList(update);

    setSellButton({
        opacity: "0.5",
        pointerEvents: "none"
    })
    try {
        const payLoad = {
            token_id: tempData._id,
            user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
            apiConfig.manual_approve.url,
            apiConfig.manual_approve.method,
            props.credential.loginToken,
            payLoad
        );


        if (response.status === 200) {
            showNotify(response.data.message, 'success');
            const updateData = [...itemList];
            tempData.message = response.data.message;
            tempData.status = 200;
            tempData.isApproveDisabled = true;
            tempData.isSellDisabled = false;
            if (type === 1) {
                updateData[key] = tempData;
            }
            else if (type === 2) {
                updateData[key].tokens[col] = tempData;
            }
            updateData[key].utils.loading_approve_button = false;
            setItemList(updateData)
        }
        setSellButton({
            opacity: "1",
            pointerEvents: 'initial'
        })
    } catch (error) {
        const updateData = [...itemList];
        tempData.isSellDisabled = false;
        tempData.message = error.response.data.message;
        tempData.status = 400;
        if (type === 1) {
            updateData[key] = tempData;
        }
        else if (type === 2) {
            updateData[key].tokens[col] = tempData;
        }
        updateData[key].utils.loading_approve_button = false;
        setItemList(updateData);

        setSellButton({
            opacity: "1",
            pointerEvents: 'initial'
        })

        if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
        else showNotify('Something went wrong', 'danger');
    }
};



export const onSellHandle = async (e, key, col, itemList, setItemList, props, ApiCall, apiConfig, showNotify, type) => {
    let tempData = null;
    if (type === 1) {
        tempData = itemList[key];
    }
    else if (type === 2) {
        tempData = itemList[key].tokens[col];
    }

    const update = [...itemList];
    update[key].utils.loading_sell_button = true;
    setItemList(update);
    try {
        const payLoad = {
            user_id: props.credential.loginUserName,
            token_id: tempData._id,
            owner_address: tempData.owner_address,
            token_address: tempData.token_address,
            slippage: tempData.slippage,
            gas_price: tempData.gas_price,
            gas_limit: tempData.gas_limit,
            sell_percentage: tempData.percentage,
            type: 1,
        };
        const response = await ApiCall(
            apiConfig.token_sell.url,
            apiConfig.token_sell.method,
            props.credential.loginToken,
            payLoad
        );
        if (response.status === 200) {
            showNotify(response.data.message, 'success');

            const updateData = [...itemList];

            tempData.message = response.data.message;
            tempData.status = 200;
            tempData.percentage = 100;
            if (type === 1) {
                updateData[key] = tempData;
            }
            else if (type === 2) {
                updateData[key].tokens[col] = tempData;
            }
            updateData[key].utils.loading_sell_button = false;
            setItemList(updateData);
        }
    } catch (error) {
        const updateData = [...itemList];

        tempData.message = error.response.data.message;
        tempData.status = 400;
        if (type === 1) {
            updateData[key] = tempData;
        }
        else if (type === 2) {
            updateData[key].tokens[col] = tempData;
        }

        updateData[key].utils.loading_sell_button = false;
        setItemList(updateData);
        if (error.response && typeof error.response.data.message === 'string') {
            showNotify(error.response.data.message, 'danger');
        } else {
            showNotify('Something went wrong', 'danger');
        }
    }
};

export const onRemoveToken = async (e, index, key, col, itemList, setItemList, props, ApiCall, apiConfig, showNotify, setColData, setRowData, type) => {
    if (type === 2 && ((key < 0 || col < 0) || (index !== key))) {
        showNotify("Please choose token you want to remove.", "danger");
        return;
    }
    let tempData = null;
    if (type === 1) {
        tempData = itemList[key];
    }
    else if (type === 2) {
        tempData = itemList[key].tokens[col];
    }
    try {
        const payLoad = {
            token_id: tempData._id,
            user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
            apiConfig.remove_token_pending.url,
            apiConfig.remove_token_pending.method,
            props.credential.loginToken,
            payLoad
        );
        if (response.status === 200) {
            showNotify(response.data.message, "success");
            if (type === 1) {
                setItemList((ele) => {
                    let ele1 = JSON.parse(JSON.stringify(ele));
                    ele1.splice(key, 1);
                    return ele1;
                });
            }
            else if (type === 2) {
                const update = [...itemList];
                update[key].tokens[col].label = '';
                update[key].is_visible = 'none';
                const row = update[key];
                row.tokens.splice(col, 1);
                setColData(-1);
                setRowData(-1);
                setItemList(update);
            }
        }
    } catch (error) {
        showNotify("Failed to remove your Token.", "danger");
    }
}