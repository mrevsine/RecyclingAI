import React, { Component,useState, useEffect } from "react";
import {Button, Modal, Checkbox} from 'antd'
import "./start.css";

function StartContainer() {

    const [agree, setAgree] = useState(false);
    const [task, setTask] = useState(0);

    const checkboxHandler = () => {
        setAgree(!agree);
    }

    const routeChange = () =>{ 
        if (task % 2 === 0) {
            let path = '/#/Main2'; 
            window.location.assign(path);
        } else {
            let path = '/#/Main1'; 
            window.location.assign(path);
        }


    }

    const routeChangeToMain1 = () =>{    
        let path = '/#/Main1'; 
        window.location.assign(path);
    }

    

    

    // connect with the backend to randomize the task 
    useEffect(() => {
        fetch('http://localhost:8080/setup')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            console.log(data['task_number']);
            setTask(data['task_number']);
            // send user id as well
            localStorage.setItem('user-id', data['user_id']);
            console.log(localStorage)
        });
    }, []);

    
    return (
      <div className="page-container">
        
        <h1 className="head-text">Homepage</h1> 

        <div className="text"> 
        This website...
        </div>
        
        <div className="instructions-head">
            <h2 className="req-text"> Requirments for Uploading Images</h2>
        </div>

        <div className="image-instructions">
    
            <div className="text"> 
                <ul>
                    <li>bullet point</li>
                    <li>bullet point</li>
                </ul> 
            </div>
        </div>
        
        {/*want to clear databse for recycle, action broke?*/}
        <div className="upload-button"> 
            <Button onClick={routeChangeToMain1}>
                To Task
            </Button>
        </div>

      </div>
      );
}

export default StartContainer;