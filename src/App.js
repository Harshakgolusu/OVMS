import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './components/Login';
import Connected from './components/Connected';
import './App.css';
import VideoRecorder from './components/VideoRecorder';


function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [CanVote, setCanVote] = useState(true);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);


  useEffect(() => {
    if (isConnected) {
      getCandidates();
      getRemainingTime();
      getCurrentStatus();
    }
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isConnected]);

  async function vote() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );

      const tx = await contractInstance.vote(number);
      await tx.wait();
      canVote();
    } catch (error) {
      console.error("Voting failed", error);
    }
  }

  async function canVote() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const voteStatus = await contractInstance.voters(await signer.getAddress());
      setCanVote(voteStatus); 
    } catch (error) {
      console.error("Failed to check voting eligibility", error);
    }
  }

  async function getCandidates() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const candidatesList = await contractInstance.getAllVotesOfCandiates();

      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber(),
      }));
      
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Failed to get candidates", error);
    }
  }

  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getVotingStatus();
      setVotingStatus(status);
    } catch (error) {
      console.error("Failed to get voting status", error);
    }
  }

  async function getRemainingTime() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const time = await contractInstance.getRemainingTime();
      setRemainingTime(parseInt(time, 16));
    } catch (error) {
      console.error("Failed to get remaining time", error);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetaMask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected");
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }
  const handleRecordComplete = (videoBlob) => {
    console.log("Recording complete, video blob:", videoBlob);
    setIsRecordingComplete(true); // Allow access to voting after recording
  };
  

  return (
    <div className="App">
      {!isRecordingComplete ? (
        // Display VideoRecorder until the recording is complete
        <VideoRecorder onRecordComplete={handleRecordComplete} />
      ) : isConnected ? (
        // Show Connected component for voting when the user is connected and recording is complete
        <Connected
          account={account}
          candidates={candidates}
          remainingTime={remainingTime}
          number={number}
          handleNumberChange={handleNumberChange}
          voteFunction={vote}
          showButton={CanVote}
        />
      ) : (
        // Show Login component if the user is not connected
        <Login connectWallet={connectToMetaMask} />
      )}
    </div>
  );
  
}

export default App;
