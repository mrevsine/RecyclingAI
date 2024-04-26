import React, { Component, useState, useEffect } from "react";
import {Button, Modal, Checkbox, Input, Radio} from 'antd'
import "antd/dist/antd.css";
import "./main.css";
import Popup from 'reactjs-popup';

import PredictionContainer from '../../components/predictionContainer'

function Main1Container() {
    const [text, setText] = useState("");
    const [task, setTask] = useState(0);
    const [choice, setChoice] = useState(0);
    const [tmpUser, setTmpUser] = useState(0);
    const [imageData, setImageData] = useState([]);
    const [currentImage, setCurrentImage] = useState("");
    const [currentPrediction, setCurrentPrediction] = useState("");
    const [imageCount, setImageCount] = useState(0);
    const [showPrediction, setShowPrediction] = useState(false);
    const [taskTime, setTaskTime] = useState((Date.now() + 1000 * 1000));

    const [currentTime, setCurrentTime] = useState(0);
    const [moveToSurvey, setMoveToSurvey] = useState(false);

    const [render, setRender] = useState(false);

    let totalImages = 3;
    const baseImgUrl = "./";

    const nextChange = () =>{
        /*if (choice<1) {
            alert("Please make sure to complete all the fields!");
        } else {*/
            let count = imageCount + 1;
            // save data
            let data = {
                q_id: currentImage,
                user_id: tmpUser,
                ans: choice,
                input: text, 
                time: ((Date.now() - taskTime) / 1000).toFixed(3)
            };
            console.log(data)
            sendData(data)
            if (count >= totalImages) {
                console.log('done with images')
                setMoveToSurvey(true);
            } else {
                // reinitialize variables
                setChoice(0); 
                setText("")
                setImageCount(count);
                setCurrentImage(imageData[count].name);
                setCurrentPrediction(imageData[count].label);
                setTaskTime(Date.now())
                setShowPrediction(false);
            }
        //}
    }

    const subDataToDb = () =>{
            // save data
            let data = {
                q_id: "Recycle or Not",
                user_id: tmpUser,
                ans: choice,
                input: text, 
                time: ((Date.now() - taskTime) / 1000).toFixed(3)
            };
            console.log(data)
            sendData(data)
    }

    {/*recycle*/}
    const subDataToDbYes = () =>{
        // save data
        let data = {
            q_id: "Recycle or Not",
            user_id: tmpUser,
            ans: choice,
            input: "Yes", 
            time: ((Date.now() - taskTime) / 1000).toFixed(3)
        };
        console.log(data)
        sendData(data)
    }

    const subDataToDbNo = () =>{
        // save data
        let data = {
            q_id: "Recycle or Not",
            user_id: tmpUser,
            ans: choice,
            input: "No", 
            time: ((Date.now() - taskTime) / 1000).toFixed(3)
        };
        console.log(data)
        sendData(data)
    }

    const deleteAllData = () => {
        fetch('http://localhost:8080/deleteAllData', {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // Log the response message
            // Perform any additional actions after deleting all data
        })
        .catch(error => {
            console.error('Error deleting all data:', error);
        });
    }

    {/*recycle*/}

    const routeChangeToStart = () =>{ 
        let path = '/#/'; 
        // history.push(path);
        window.location.assign(path);
        console.log('moving to home page')
      }

    const sendData = (obj) => {
        fetch('http://localhost:8080/responsesData', {
          method: 'POST',
          body: JSON.stringify(obj),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }).then(response => response.json())
          .then(message => {
            console.log(message)
          })
      }
      
    


    const onChangeMultiple= e => {
        setChoice(e.target.value);

    };

    const onChangeInput = e => {
        setText(e.target.value);
    };

    const handlePredict=()=>{
        setShowPrediction(true);
    };

    // testing communication with backend
    useEffect(() => {
        fetch('http://0.0.0.0:8080/time').then(res => 
        res.json()).then(data => {
            setCurrentTime(data.time);
            console.log(data.time)
        });
        }, []);

    // create a new user here 
    useEffect(() => {
        fetch('http://localhost:8080/setup_main')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            console.log(data['task_number']);
            setTask(data['task_number']);
            // send user id as well
            setTmpUser(data['user_id'])
        });
    }, []);
    

    // initialize image
    useEffect(() => {
        console.log('getting images')
        fetch('http://localhost:8080/imageInfo')
        .then(response => response.json())
        .then(data => {
            console.log(data['imgs']);
            setImageData(data['imgs']);
            let image_name = data['imgs'][0].name
            setCurrentImage(image_name)
            console.log(image_name)
            setCurrentPrediction(data['imgs'][0].label);
            setRender(true);
            setTaskTime(Date.now())
        });
    }, []);



    return (
      <>
       {render ?

            <div className="page-container">
            <div className="head-text">Recycle or Not?</div>
            <div className="column-container"> 
            <div className="left-column"> 
                <div className="popup-button-container">
                    <img src={require('./Mexican_Wolf_Input_Image_1.jpg')}/>
                    
                    <Popup trigger=
                    {<Button className="btn-muzzle" size = "xs"> </Button>}
                    position="absolute">
                    <div className="popup">Thick muzzle</div>
                    </Popup>

                    <Popup trigger=
                    {<Button className="btn-coat" size = "xs">  </Button>}
                    position="absolute">
                    <div className="popup">Buff, gray, and rust colored fur</div>
                    </Popup>
                </div>
            
            </div>
    

            </div>
            <p className="click-text">Click the yellow squares to inspect the image features.</p>
            <h2 className="rank-text">Top Matches</h2>
            <div className="bgrd-container">
                <h3 className="match-text"> Best Match: 90%</h3>
                <img src={require('./Best_Match_Mexican_Wolf.jpg')}/>
                <div class="parent">
                    <ul className="bullet-text">
                        <li>Smaller subspecies </li>
                        <li>Buff, gray, and rust colored coat</li>
                        <li>Thick muzzle</li>
                        <li>Mountain woodland environment</li>
                    </ul> 
                </div>
            </div>
        
            <div className="bgrd-container">
            <div className="user-input">
                    <t> Enter the subspecies that matches your uploaded image:</t>
            
            <input
                type="text"
                value={text}
                onChange={onChangeInput}
            />

            <div className="button-container"> 
                <Button style={{marginLeft:"70%"}}  onClick={deleteAllData}> {/*changed from subDataToDb for recycle*/}
                    Clear Database
                </Button>
            </div>    

            {/*recycle*/}
            <div className="button-container-yes"> 
                <Button style={{}}  onClick={subDataToDbYes}>
                    Yes
                </Button>
            </div>

            <div className="button-container-no"> 
                <Button style={{}}  onClick={subDataToDbNo}>
                    No
                </Button>
            </div>
            {/*recycle*/}

            </div>

            <div className="button-container"> 
                <Button style={{marginLeft:"70%", marginBottom:"5%"}}  onClick={routeChangeToStart}>
                    Back
                </Button>
            </div>

            </div>
            </div>
        :
            <> 
            <h1> Loading ...</h1>
            </>
        }
      </>
       
      );
}

export default Main1Container;