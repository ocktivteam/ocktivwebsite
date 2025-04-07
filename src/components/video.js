import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";
import Layout from "./layout";
import "../style/video.css";
import Navbar from "./Navbar";

const Video = () => {
  const title = "Video Lectures";
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const getLastPlayedVideo = () => {
    const lastPlayedVideoId = localStorage.getItem("lastPlayedVideoId");
    const lastPlayedTime = localStorage.getItem("lastPlayedTime");
    return {
      videoId: lastPlayedVideoId || "defaultVideoId",
      time: lastPlayedTime ? parseFloat(lastPlayedTime) : 0,
    };
  };

  const onPlayerReady = (event) => {
    const { videoId, time } = getLastPlayedVideo();
    setCurrentVideoId(videoId);
    event.target.seekTo(time, true);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 2) { // Video paused
      const currentTime = event.target.getCurrentTime();
      localStorage.setItem("lastPlayedTime", currentTime); // Save current time 
      localStorage.setItem("lastPlayedVideoId", currentVideoId); // Save video ID
    }

    if (event.data === 1) { // title of Video playing
      const videoTitle = event.target.getVideoData().title;
      setCurrentVideoTitle(videoTitle);
    }
  };

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
      listType: "playlist",
      list: "PLBDA2E52FB1EF80C9", // Playlist ID
    },
  };

  useEffect(() => {
    const { videoId, time } = getLastPlayedVideo();
    setCurrentVideoId(videoId);
    setCurrentTime(time);
  }, []);

  return (
    <>
      <Layout title={title} />
      <Navbar />
      <div className="video-container">
        <h3 className="current-video-title">{currentVideoTitle || "Loading..."}</h3>
        <div className="video-wrapper">
          <YouTube
            videoId={currentVideoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
          />
        </div>
      </div>
    </>
  );
};

export default Video;