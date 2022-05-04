import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from "./idl.json";
import kp from './keypair.json';
// import GifItem from './components/GifItem.js';

// Constants
const TWITTER_HANDLE = 'nasty_piwo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();
// As we want all users to talk to the same baseAccount we rather write it to a json file.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
console.log(baseAccount.publicKey.toString());

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const TEST_GIFS = [
  'https://media0.giphy.com/media/YKFnKWYbKREHu/giphy.gif?cid=ecf05e471nd4g9za4ai9pmdklf249y7kc75kvxwye0gi7q5y&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/wtNOUuCzFKcaA/giphy.gif?cid=ecf05e471nd4g9za4ai9pmdklf249y7kc75kvxwye0gi7q5y&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/8yyJH4yzqgx0Y/giphy.gif?cid=ecf05e471nd4g9za4ai9pmdklf249y7kc75kvxwye0gi7q5y&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/nVySvk13dgluU/200.gif?cid=ecf05e471nd4g9za4ai9pmdklf249y7kc75kvxwye0gi7q5y&rid=200.gif&ct=g'
]

const App = () => {

  class GifItem extends React.Component {
    constructor(props) {
        super(props);
        this.walletAddress = props.walletAddress.toString();
        this.state = {
            userAddress: "",
            gifLink: "",
            voteCount: 0,
            upvotedUsers: [],
            downvotedUsers: [],
        };
        this.upvotedUsers = new Array();
        this.downvotedUsers = new Array();
        this.setVoteArray(this.upvotedUsers, this.props.upvotedUsers);
        this.setVoteArray(this.downvotedUsers, this.props.downvotedUsers);
        console.log(`Upvoted Users: ${this.upvotedUsers}`);
        console.log(`Downvoted Users: ${this.downvotedUsers}`);
        this.userUpvoted = false;
        this.userDownvoted = false;

        this.setUserVotedState();
  
        // bindings are necessary to make `this` work in the callback
        this.incrementVoteCount = this.incrementVoteCount.bind(this);
        this.decrementVoteCount = this.decrementVoteCount.bind(this);
    }

    setVoteArray(voteArray, voteArrayPubkeys) {
      for( var i = 0; i < voteArrayPubkeys.length; i++){
        let pubkeyString = this.pubkeyToString(voteArrayPubkeys[i]);
        voteArray.push(pubkeyString);
      }
    }

    pubkeyToString(pubkey){
      return pubkey.toString();
    }
  
    componentDidMount() {
        this.setState({
            userAddress: this.props.userAddress.toString(),
            gifLink: this.props.gifLink.toString(),
            voteCount: this.props.voteCount,
            upvotedUsers: this.props.upvotedUsers,
            downvotedUsers: this.props.downvotedUsers,
        });
    }
  
    voteArrayContainsWalletAddress (voteArray, user) {
      for( var i = 0; i < voteArray.length; i++) {
        if (voteArray[i] === user){
          return true;
        }
      }
      return false
    }
  
    removeWalletAddressFromVoteArray (voteArray, user) {
      for( var i = 0; i < voteArray.length; i++){
        if (voteArray[i] === user){
          voteArray.splice(i, 1);
        }
      }
    }
  
    setUserVotedState () {
      this.userUpvoted = this.voteArrayContainsWalletAddress(this.upvotedUsers, this.walletAddress);
      this.userDownvoted = this.voteArrayContainsWalletAddress(this.downvotedUsers, this.walletAddress);
    }
  
    upvoteGif = async () => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.upvoteGif(this.state.gifLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully upvoted")
    
        await getGifList();
      } catch (error) {
        console.log("Error upvoting GIF:", error)
        this.removeWalletAddressFromVoteArray(this.upvotedUsers, this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount -= 1,
          upvotedUsers: this.upvotedUsers,
        }));
      }
    };
  
    downvoteGif = async () => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.downvoteGif(this.state.gifLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully downvoted")
    
        await getGifList();
      } catch (error) {
        console.log("Error downvoting GIF:", error)
        this.removeWalletAddressFromVoteArray(this.downvotedUsers, this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount += 1,
          downvotedUsers: this.downvotedUsers,
        }));
      }
    };
  
    deleteGif = async () => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.removeGif(this.state.gifLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully deleted")
    
        await getGifList();
      } catch (error) {
        console.log("Error deleting GIF:", error)
      }
    };

    cancleUpvote() {
      this.removeWalletAddressFromVoteArray(this.upvotedUsers, this.walletAddress);
      this.setState(prevState => ({
        voteCount: prevState.voteCount -= 1,
        upvotedUsers: this.upvotedUsers,
      }));
      this.removeUpvote();
      console.log("Upvote removed...");
    }

    removeUpvote = async () => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.cancleUpvoteGif(this.state.gifLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully downvoted")
        await getGifList();
      } catch (error) {
        console.log("Error downvoting GIF:", error)
        this.removeWalletAddressFromVoteArray(this.upvotedUsers, this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount += 1,
          upvotedUsers: this.upvotedUsers,
        }));
      }
    }
    
    cancleDownvote() {
      this.removeWalletAddressFromVoteArray(this.downvotedUsers, this.walletAddress);
      this.setState(prevState => ({
        voteCount: prevState.voteCount += 1,
        downvotedUsers: this.downvotedUsers,
      }));
      this.removeDownvote();
      console.log("Downvote removed...");
    }

    removeDownvote = async () => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.cancleDownvoteGif(this.state.gifLink, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("GIF successfully downvoted")
        await getGifList();
      } catch (error) {
        console.log("Error downvoting GIF:", error)
        this.removeWalletAddressFromVoteArray(this.downvotedUsers, this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount -= 1,
          downvotedUsers: this.downvotedUsers,
        }));
      }
    }
  
    incrementVoteCount () {
      this.setUserVotedState();
      if (!this.userUpvoted && !this.userDownvoted) {
        this.upvotedUsers.push(this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount += 1,
          upvotedUsers: this.upvotedUsers,
        }));
        this.upvoteGif();
        console.log("Upvote count incremented...");
      }
      else if (!this.userUpvoted && this.userDownvoted) {
        this.cancleDownvote();
      }
      this.setUserVotedState();
    }
  
    decrementVoteCount () {
      this.setUserVotedState();
      if (!this.userUpvoted && !this.userDownvoted) {
        this.downvotedUsers.push(this.walletAddress);
        this.setState(prevState => ({
          voteCount: prevState.voteCount -= 1,
          downvotedUsers: this.downvotedUsers,
        }));
        this.downvoteGif();
        console.log("Downvote count incremented...");
      }
      else if (this.userUpvoted && !this.userDownvoted) {
        this.cancleUpvote();
      }
      this.setUserVotedState();
    }
  
    render() {
      const renderVoteCount = () => {
        this.setUserVotedState();
        if(this.userUpvoted && !this.userDownvoted) {
          return <p className="gif-upvote-count">{this.state.voteCount}</p>
        } else if (this.userDownvoted && !this.userUpvoted) {
          return <p className="gif-downvote-count">{this.state.voteCount}</p>
        } else {
          return <p className="gif-standard-count">{this.state.voteCount}</p>
        }
      }
  
      const renderDeleteButton = () => {
        if (this.props.userAddress.toString() == this.walletAddress) {
          return <button className="delete-button" onClick={this.deleteGif}>X</button>
        }
      }
  
      return (
        <div className="gif-item">
          <div className="gif-item-content">
            <small className="gif-user-address">User address: {this.props.userAddress.toString()}</small>
            <img src={this.props.gifLink.toString()} />
          </div>
          <div className="gif-side-container">
            <div className="gif-vote-container">
              <button className="gif-upvote-button" onClick={this.incrementVoteCount}>⬆</button>
              {renderVoteCount()}
              <button className="gif-downvote-button" onClick={this.decrementVoteCount}>⬇</button>
            </div>
            {renderDeleteButton()}
          </div>
        </div>
      )
    }
  }

  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  // useEffects
  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  // useEffect is a hook that allows aus to do something immediately after a state like the componet or 
  // a field like the walletAdress in the second useEffect has rendered/changed
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList()
    }
  }, [walletAddress]);

  // Actions
  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account);
      setGifList(account.gifList);

    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();

    } catch (error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

    // UI events
    const onInputChange = (event) => {
      const { value } = event.target;
      setInputValue(value);
    };
  
    const onInputSubmit = (event) => {
      event.preventDefault();
      sendGif();
    }

  const renderConnectedContainer = () => {
    const provider = getProvider();
    // If we hit this, it means the program account hasn't been initialized.
      if (gifList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-gif-button" onClick={createGifAccount}>
              Do One-Time Initialization For GIF Program Account
            </button>
          </div>
        )
      } 
      // Otherwise, we're good! Account exists. User can submit GIFs.
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={onInputSubmit}
            >
              <input
                type="text"
                placeholder="Enter gif link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {/* {TEST_GIFS.map(gif => (
              <div className="gif-item" key={gif}>
                <img src={gif} alt={gif} />
              </div>
              ))} */}
              {/* Map through gifList instead of TEST_GIFS */}
              {/* {gifList.map((gif) => (
                <div className="gif-item" key={gif}>
                  <img src={gif} alt={gif} />
                </div>
              ))} */}
              {/* We use index as the key instead, also, the src is now item.gifLink */}
              {gifList.map((item, index) => (
                <GifItem className="gif-item-container"
                  key={index} 
                  userAddress={item.userAddress} 
                  gifLink={item.gifLink} 
                  upvotedUsers={item.upvotedUsers}
                  downvotedUsers={item.downvotedUsers}
                  voteCount={item.voteCount}
                  walletAddress={provider.wallet.publicKey}/>
              ))}
            </div>
          </div>
        )
      }
    };

  return (
    <div className="App">
      {/* This was solely added for some styling fanciness */}
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🦧 GIF Portal</p>
          <p className="sub-text">
            View your orangutan GIF collection in the metaverse ✨
          </p>
          {/* Render your connect to wallet button right here */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
