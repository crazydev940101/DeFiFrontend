/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert";
import {
  Card, CardBody, CardHeader, CardFooter, Form, FormGroup, Input, Col, Row, Button
} from "reactstrap";
import { globalVariables } from "../../../../variables/variable.js";
import "./methodpanel.css";

function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}

const MethodPanel = (props) => {
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const { showNotify } = props;

  const [newItem, setNewItem] = useState({ function_signature: '', function_name: '', function_description: '', status: '' });
  const [itemList, setItemList] = useState([]);
  const [selectedOption, setSelectedOption] = useState({ value: 0, label: 'Rug pull' });
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  const methodOption = [
    {
      value: 0,
      label: 'Rug pull',
    },
    {
      value: 1,
      label: 'Token status'
    },
    {
      value: 2,
      label: 'Trading events'
    },
  ];


  useEffect(() => {
    /**
    *    get all transactions methods from DB
    */
    setLoading(true);
    async function getAllMethods() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName,
          status: 0
        };
        const response = await ApiCall(
          apiConfig.get_signature.url,
          apiConfig.get_signature.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.status === 200 && response.data.signatures) {
          if (isMounted()) {
            setItemList(response.data.signatures);
            setLoading(false);
          }
        }
      } catch (error) {
        if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
        else showNotify('Something went wrong', 'danger');
      }
    }
    getAllMethods();
  }, [props.credential.loginToken]);



  /**
   *    add new transaction method to be detected
   */
  const onAddNewMethod = async (e) => {
    e.preventDefault();
    if (newItem.function_signature === "") {
      showNotify('Please input your method function.', 'danger');
      return;
    }
    if (newItem.function_name === "") {
      showNotify('Please input your method id.', 'danger');
      return;
    }
    if (newItem.function_description === "") {
      showNotify('Please input your method id.', 'danger');
      return;
    }
    if (newItem.status === "") {
      showNotify('Please input your method status.', 'danger');
      return;
    }
    try {
      const payLoad = {
        signature: newItem.function_signature,
        name: newItem.function_name,
        description: newItem.function_description,
        status: newItem.status,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.add_signature.url,
        apiConfig.add_signature.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200 && response.data.signature) {
        itemList.unshift(response.data.signature);
        setNewItem({ function_signature: '', function_name: '', function_description: '' });
        showNotify(response.data.message, 'success');
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  }



  /**
   *    remove transaction method what you want to delete 
   */

  const onRemoveMethod = async (e, key) => {
    e.preventDefault();
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        signature_id: itemList[key]._id
      };
      const response = await ApiCall(
        apiConfig.remove_signature.url,
        apiConfig.remove_signature.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify(response.data.message, "success");
        setItemList((ele) => {
          let ele1 = JSON.parse(JSON.stringify(ele));
          ele1.splice(key, 1);
          return ele1;
        });
      } else {
        showNotify(response.data.error, "danger");
      }
    } catch (error) {
      showNotify("Failed to remove your method.", "danger");
    }
  }

  const confirmationCheck = () => {
    confirmAlert({
      title: 'Confirm to submit',
      message: 'Are you sure to delete all methods',
      buttons: [
        {
          label: 'Yes',
          onClick: () => onDeleteAllMethods()
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  }

  /**
   *  remove all transaction methods
   */

  const onDeleteAllMethods = async () => {
    try {
      const payLoad = {
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.f_remove_all_log.url,
        apiConfig.f_remove_all_log.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        setItemList([]);
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to delete all methods.", "danger");
    }
  }

  /**
   *  fiiter transaction methods by method id
   */
  const onFilterById = async (item) => {
    setSelectedOption(item);
    setLoading(true)
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        status: item.value
      };
      const response = await ApiCall(
        apiConfig.get_signature.url,
        apiConfig.get_signature.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200 && response.data.signatures) {
        if (isMounted()) {
          setItemList(response.data.signatures);
          setLoading(false);
        }
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  }

  /**
   * 
   */
  const onDoSimulation = async () => {
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        name: newItem.function_name
      };
      const response = await ApiCall(
        apiConfig.get_hex_from_function.url,
        apiConfig.get_hex_from_function.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200 && response.data.result) {
        if (isMounted()) {
          const functionId = { ...newItem };
          functionId.function_signature = response.data.result;
          setNewItem(functionId);
          showNotify("Successfully retrieved function signature", 'success');
        }
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  }

  /**
   *  to update the trader's name
   */

  const onHandleEdit = (e, key) => {
    e.preventDefault();
    setEditMode(true);
    setEditedData(itemList[key]);
  };

  const onHandleSave = async (e, key) => {
    const updatedData = [...itemList];
    const index = updatedData.findIndex((item) => item.id === editedData.id);
    updatedData[index] = editedData;
    setItemList(updatedData);
    setEditMode(false);
    setEditedData({});

    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        signature_id: editedData._id,
        signature: editedData.signature,
        name: editedData.name,
        description: editedData.description,
        status: editedData.status
      };
      const response = await ApiCall(
        apiConfig.change_signature.url,
        apiConfig.change_signature.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify("Successfully updated method information", 'success');
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  };

  const onHandleCancel = () => {
    setEditMode(false);
    setEditedData({});
  };

  const onHandleChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      setEditedData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    } else {
      const updatedData = { ...editedData };
      updatedData.status = e.value;
      setEditedData(updatedData);
    }

  };

  return (
    <>
      <Card>
        <CardHeader>
          <h5 className="title">Detect Methods</h5>
        </CardHeader>
        <CardBody>
          <Form>
            <Row>
              <Col className="pr-md-1" md="12">
                <Row>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>Function Signature</label>
                      <Input type="text" value={newItem.function_signature} onChange={(e) => setNewItem({ ...newItem, function_signature: e.target.value })} />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>Function Name</label>
                      <Input type="text" value={newItem.function_name} onChange={(e) => setNewItem({ ...newItem, function_name: e.target.value })} />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>Function Description</label>
                      <Input type="text" value={newItem.function_description} onChange={(e) => setNewItem({ ...newItem, function_description: e.target.value })} />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>Status</label>
                      <Select
                        options={methodOption}
                        className="react-select info"
                        classNamePrefix="react-select"
                        defaultValue={newItem.status}
                        onChange={(e) => {
                          setNewItem({ ...newItem, status: e.value })
                        }}
                      >
                      </Select>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
          <Row>
            <Col className="pr-md-1 toggle_botton" md="2">
              <Button className="btn-fill" color="green" type="submit" onClick={onAddNewMethod}>
                Add
              </Button>
            </Col>
            <Col className="pr-md-1 toggle_botton" md="2">
              <Button className="btn1" color="btn1" type="submit" onClick={onDoSimulation}>
                Simulate
              </Button>
            </Col>
            <Col className="pr-md-1" md="4"></Col>
            <Col className="pr-md-1" md="2">
              <FormGroup>
                <label>Filter</label>
                <Select
                  options={methodOption}
                  className="react-select info"
                  classNamePrefix="react-select"
                  defaultvalue={methodOption[0]}
                  value={selectedOption}
                  onChange={(item) => onFilterById(item)}
                >
                </Select>
              </FormGroup>
            </Col>
            <Col className="pr-md-1 toggle_botton" md="2" style={{ textAlign: "left", marginTop: '18px' }}>
              <Button className="btn1" color="btn1" type="submit" onClick={confirmationCheck} style={{ marginRight: "15px" }}>
                Delete all
              </Button>
            </Col>
          </Row>
          {
            loading ? (
              <ClipLoader color={globalVariables.GREEN} size="50px" />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Function Signature</th>
                    <th>Function Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Edit</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {itemList.map((item, key) => (
                    <tr key={item.id}>
                      <td>{key + 1}</td>
                      <td>{editMode && editedData.id === item.id ?
                        <FormGroup><Input type="text" name="signature" value={editedData.signature} onChange={onHandleChange} /></FormGroup> : item.signature}
                      </td>
                      <td>{editMode && editedData.id === item.id ?
                        <FormGroup><Input type="text" name="name" value={editedData.name} onChange={onHandleChange} /></FormGroup> : item.name}
                      </td>
                      <td>{editMode && editedData.id === item.id ?
                        <FormGroup><Input type="text" name="description" value={editedData.description} onChange={onHandleChange} /></FormGroup> : item.description}
                      </td>
                      <td>{editMode && editedData.id === item.id ?
                        <FormGroup style={{ width: 150 }}>
                          <Select
                            options={methodOption}
                            name="status"
                            className="react-select info"
                            classNamePrefix="react-select"
                            defaultValue={editedData.status}
                            onChange={onHandleChange}
                          />
                        </FormGroup>
                        // <select name="status" value={editedData.status} onChange={onHandleChange}>
                        //     <option value="0">Rug pull</option>
                        //     <option value="1">Token status</option>
                        //     <option value="2">Trading events</option>
                        // </select>
                        : methodOption.filter(ele => ele.value === item.status)[0]?.label}
                      </td>
                      <td>
                        {editMode && editedData.id === item.id ? (
                          <div className="handle-edit-method" style={{ display: 'flex' }}>
                            <Button onClick={e => onHandleSave(e, key)} className="btn-simple btn-round method-panel-1" color="danger">
                              <i className="tim-icons icon-check-2" />
                            </Button>
                            <Button onClick={onHandleCancel} className="btn-simple btn-round" color="danger">
                              <i className="tim-icons icon-simple-remove" />
                            </Button>
                          </div>
                        ) : (
                          <a href="" onClick={(e) => onHandleEdit(e, key)} >
                            <i className="tim-icons icon-pencil edit-pencil" />
                          </a>
                        )}
                      </td>
                      <td>
                        <Button onClick={(event) => onRemoveMethod(event, key)} className="btn-simple btn-round" color="danger">
                          <i className="tim-icons icon-simple-remove" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </CardBody>
        <CardFooter>

        </CardFooter>
      </Card>
    </>
  )
}

export default MethodPanel