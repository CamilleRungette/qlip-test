import React, {useState, useMemo, useEffect} from 'react'
import "./App.scss";
import jsonData from "./transcript.json";
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import {BsArrowCounterclockwise} from "react-icons/bs"

const App = () => {

  const json = jsonData.monologues[0];

  const [convertedText, setConvertedText] = useState("");
  const [timesStamps, setTimestamps] = useState({
    initial: 0,
    end: 0
  });
  
  useMemo(() => {
    let value = ""
    json.elements.map(el => {
      if (el.value) value += el.value
    });

    setConvertedText(value);
  }, []);


  useEffect(() => {
    cancelTrim();
  }, [])

  const getFocus = (e) => {
    if (e && e.index !== 0 && e.length !== 0){
      const video = document.getElementById('video');

      let elements = json.elements.filter(el => el.type === "text");
      let selectedStr = convertedText.substring(e.index, e.index + e.length + 1);
      let selectedWords = selectedStr.split(' ').filter(e => e !== "");

      selectedWords.forEach((el, i) => {
        if (!el.slice(-1).match(/[a-zA-Z0-9]/i)) selectedWords[i] = el.slice(0, -1)
      });
      
      let selectedElements = []; let i1 = 0; let i2 = 0;

      new Promise((resolve, reject) => {
        for (let i = 0; i < elements.length; i++){
          if (elements[i].value === selectedWords[i1]){
            if(i1 === 0){
              selectedElements.push(elements[i]); 
              i1 +=1;
              i2 = i;
            } else {
              if (selectedElements[i1 - 1] === elements[i -1]){
                selectedElements.push(elements[i]);
                if (i1 + 1 !== selectedWords.length) i1 += 1;
                else break;
                i2 = i;
              } else {
                selectedElements = [];
                i1 = 0;
                i = i2;
              };
            };
          };
          resolve (selectedElements)
        };
      }).then(result => {
        if (result.length) setTimestamps({initial: selectedElements[0].ts, end: selectedElements[selectedElements.length-1].ts})
        else setTimestamps({initial: 0, end: video.duration});
      });
    };
  };

  
  const playVideo = () => {
    // Lecture vidéo
    const video = document.getElementById('video');
  
    let startTime = timesStamps.initial;
    let endTime = timesStamps.end !== 0 ? timesStamps.end : video.duration;

    video.addEventListener("timeupdate", function() {
        if (this.currentTime >= endTime) {
            this.pause();
        };
    });

    video.currentTime = startTime;
    video.play();    

    // Affichage texte
    let beginning = json.elements.findIndex(e => e.ts == timesStamps.initial);
    let end = json.elements.findIndex(e => e.ts == timesStamps.end);

    if (timesStamps.initial !== 0 & timesStamps.end !== video.duration){
      let selectedStr = "";
      for (let i = beginning; i < end+1; i++){
        selectedStr += json.elements[i].value;
      };
      setConvertedText(selectedStr);
    };
  };


  const cancelTrim = () => {
    const video = document.getElementById('video');
    console.log(video);
    video.pause();
    video.currentTime = 0;
    setTimestamps({initial: 0, end: video.duration ? video.duration : 0});

    let newText = ""
    json.elements.map(el => {
      if (el.value) newText += el.value
    });
    setConvertedText(newText);
  };

  const saveVideo = () => {
    console.log(convertedText);
  }

  return (
    <div className='main-app'>
      <div className='highlight'>
        <div className='highlight-infos'>
          <h1 className='highlight-title'>Highlight 1</h1>
            <div>
              <h3 className='highlight-title'>Speaker {json.speaker} </h3>
              <h3 className='highlight-title'>{timesStamps.end !== 0 ? (timesStamps.end - timesStamps.initial).toFixed(2)+ " seconds" : <> </>} </h3>
            </div>

          <div className='highlight-buttons'>
            <button className='primary-button' onClick={playVideo}>Play</button>
            <BsArrowCounterclockwise onClick={cancelTrim} className='icon' />
          </div>
        </div>
        <video id="video" height="300px" controls>
          <source src="/Reaction_Time.mp4" type="video/mp4"/>
        </video>
      </div>

      <div className='editor'>
        <ReactQuill
          theme='snow'
          value={convertedText}
          onChange={setConvertedText}
          style={{minHeight: '150px'}}
          onChangeSelection={getFocus}
        />
      </div>

      <div className='button-div'>
        <button className='primary-button' onClick={saveVideo}>Save video</button>
      </div>
    </div>
  )
}

export default App;