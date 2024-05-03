import React, { useState, useEffect } from "react";
import { Button } from 'antd';
import "antd/dist/antd.css";
import "./main.css";

function Main1Container() {
    const [text, setText] = useState("");
    const [tmpUser, setTmpUser] = useState(0);
    const [imageData, setImageData] = useState([]);
    const [currentImage, setCurrentImage] = useState("");
    const [imageCount, setImageCount] = useState(0);
    const [render, setRender] = useState(false);
    const [textData, setTextData] = useState([]);
    const [choice, setChoice] = useState(0);
    const [taskTime, setTaskTime] = useState((Date.now() + 1000 * 1000));
    const [showPrediction, setShowPrediction] = useState(false);
    const [choiceMade, setChoiceMade] = useState(false);
    const [showButtons, setShowButtons] = useState(true); // New state variable
    const [showRightContainer, setShowRightContainer] = useState(true);
    const [nextImageCount, setNextImageCount] = useState(0);
    const [buttonClickCount, setButtonClickCount] = useState(0); // New state variable

    let totalImages = 3;

    const images = [
        '/plastic_bottle.jpeg',
        '/plastic_bottle.jpeg',
        '/battery.jpeg',
        '/battery.jpeg',
        '/glass_bottle.jpeg',
        '/glass_bottle.jpeg',
        '/glass_cup.jpeg',
        '/glass_cup.jpeg',
        '/pizza_box.jpeg',
        '/pizza_box.jpeg',  
        '/clamshell_container.jpeg',
        '/clamshell_container.jpeg',
        '/aerosol_cans.jpeg',
        '/aerosol_cans.jpeg',
        '/envelope.jpeg',
        '/envelope.jpeg',
        '/construction_paper.jpeg',
        '/construction_paper.jpeg',
        '/napkins.jpeg'
    ];

    const AI_text = [
        "",
        "/item_descriptions/plastic_bottle.txt",
        "",
        "/item_descriptions/battery.txt",
        "",
        "/item_descriptions/glass_bottle.txt",
        "",
        "/item_descriptions/glass_cup.txt",
        "",
        "/item_descriptions/pizza_box.txt",
        "",
        "/item_descriptions/clamshell_container.txt",
        "",
        "/item_descriptions/aerosol_cans.txt",
        "",
        "/item_descriptions/envelope.txt",
        "",
        "/item_descriptions/construction_paper.txt",
        "",
        "/item_descriptions/napkins.txt",
    ];

    const [curImg, setCurImg] = useState(0);
    const [curText, setCurText] = useState(0);

    const nextImg = () => {
        setCurImg((prevIndex) => (prevIndex + 1) < images.length ? (prevIndex + 1) : 0);
    };

    const nextText = () => {
        setCurText((prevIndex) => (prevIndex + 1) < images.length ? (prevIndex + 1) : 0);
    };

    const nextChange = () =>{
        let count = imageCount + 1;
        if (count >= totalImages) {
            console.log('done with images');
        } else {
            setChoice(0); 
            setText("");
            setImageCount(count);
            setCurrentImage(imageData[count].name);
            setTaskTime(Date.now());
            setShowPrediction(false);
            setChoiceMade(false); // Reset choiceMade state
            setShowButtons(true); // Show buttons again
        }
    };

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
    };

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
    };

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
    };

    const yesButtonActions = () => {
        subDataToDbYes();
        nextImg();
        nextText();
        setChoiceMade(true);
        setShowButtons(false); // Hide buttons after choice
        setButtonClickCount((prevCount) => prevCount + 1);
        setNextImageCount((prevCount) => prevCount + 1);
        setShowRightContainer(true);
    };

    const noButtonActions = () => {
        subDataToDbNo();
        nextImg();
        nextText();
        setChoiceMade(true);
        setShowButtons(false); // Hide buttons after choice
        setButtonClickCount((prevCount) => prevCount + 1);
        setNextImageCount((prevCount) => prevCount + 1);
        setShowRightContainer(true);
    };

    const yesButtonActions2 = () => {
        subDataToDbYes();
        nextImg();
        nextText();
        setChoiceMade(true);
        setShowButtons(true); // Hide buttons after choice
        setButtonClickCount((prevCount) => prevCount + 1);
        setNextImageCount((prevCount) => prevCount + 1);
        setShowRightContainer(false);
    };

    const noButtonActions2 = () => {
        subDataToDbNo();
        nextImg();
        nextText();
        setChoiceMade(true);
        setShowButtons(true); // Hide buttons after choice
        setButtonClickCount((prevCount) => prevCount + 1);
        setNextImageCount((prevCount) => prevCount + 1);
        setShowRightContainer(false);
    };

    const deleteAllData = () => {
        fetch('http://localhost:8080/deleteAllData', {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('Error deleting all data:', error);
        });
    };

    const routeChangeToStart = () =>{ 
        let path = '/#/'; 
        window.location.assign(path);
        console.log('moving to home page');
    };

    const sendData = (obj) => {
        fetch('http://localhost:8080/responsesData', {
          method: 'POST',
          body: JSON.stringify(obj),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }).then(response => response.json())
          .then(message => {
            console.log(message);
          });
    };

    useEffect(() => {
        const fetchData = async () => {
            const textDataArray = [];
            for (let i = 0; i < AI_text.length; i++) {
                if (AI_text[i] !== "") {
                    const response = await fetch(AI_text[i]);
                    const text = await response.text();
                    textDataArray.push(text);
                } else {
                    textDataArray.push("");
                }
            }
            setTextData(textDataArray);
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetch('http://localhost:8080/setup_main')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setTmpUser(data['user_id']);
        });
    }, []);

    useEffect(() => {
        fetch('http://localhost:8080/imageInfo')
        .then(response => response.json())
        .then(data => {
            console.log(data['imgs']);
            setImageData(data['imgs']);
            let image_name = data['imgs'][0].name;
            setCurrentImage(image_name);
            console.log(image_name);
            setRender(true);
        });
    }, []);

    return (
        <>
            {render ?
                <div className="page-container">
                    <div className="head-text">Is this recyclable?</div>
                    <div className="bgrd-container">
                        <div className="left-container">
                            <div className="image-container">
                                <img src={images[curImg]} alt="item" />
                                <h3 className="match-text">Select whether you think the item in the image can be recycled or not.</h3>
                            </div>
                            <div className="button-container">
                                {showButtons && <div className="button-container-yes">
                                    <Button onClick={yesButtonActions}>Yes</Button>
                                </div>}
                                {showButtons && <div className="button-container-no">
                                    <Button onClick={noButtonActions}>No</Button>
                                </div>}
                            </div>
                        </div>
                        {choiceMade && showRightContainer && (
                            <div className="right-container">
                                <div className="prediction-cont">
                                    <h3 className="prediction-text">Our model's recommendation:</h3>
                                    <p className='AI_exp'>{textData[curText]}</p>
                                </div>
                                <div className="prediction-cont2">
                                    <h3 className="question2"> Is your answer different after reading the recommendation?</h3>
                                    <h3 className="AI_exp"> Answer again to the question: </h3>
                                    <h3 className="question2"> Is the item in the image recyclable?</h3>
                                    <div className="button-container">
                                        <div className="button-container-yes">
                                            <Button onClick={yesButtonActions2}>Yes</Button>
                                        </div>
                                        <div className="button-container-no">
                                            <Button onClick={noButtonActions2}>No</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="button-container-nav"> 
                        <Button style={{marginRight:"100%", marginBottom:"0%"}} onClick={routeChangeToStart}>
                            Back
                        </Button>
                        <Button style={{marginLeft:"0%", marginBottom:"0%"}} onClick={deleteAllData}>
                            Clear Database
                        </Button>
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
