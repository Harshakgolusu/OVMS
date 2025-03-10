import { useEffect, useRef, useState } from 'react';

const VideoRecorder = ({ onRecordComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Start the camera when the component mounts
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startStream();

    // Stop camera when component unmounts or recording stops
    return () => stopMediaStream();
  }, []);

  const startRecording = () => {
    if (mediaStream) {
      mediaRecorderRef.current = new MediaRecorder(mediaStream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        onRecordComplete(event.data);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      console.error("Media stream not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopMediaStream(); // Stop camera when recording ends
    }
  };

  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop()); // Stop each track
      setMediaStream(null); // Clear media stream reference
    }
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "18px",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  };

  return (
    <div style={{ textAlign: "center" }}>
      <video ref={videoRef} autoPlay playsInline style={{ display: "block", margin: "0 auto" }} />
      <div>
        {!isRecording ? (
          <button onClick={startRecording} style={buttonStyle}>Start Recording</button>
        ) : (
          <button onClick={stopRecording} style={buttonStyle}>Stop Recording</button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
