import React from 'react';

class GifItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userAdress: "",
            gifLink: "",
            upvoteCount: 0,
            downvoteCount: 0,
        };

        // bindings are necessary to make `this` work in the callback
        this.incrementUpvoteCount = this.incrementUpvoteCount.bind(this);
        this.incrementDownvoteCount = this.incrementDownvoteCount.bind(this);
    }

    componentDidMount() {
        this.setState({
            userAddress: this.props.userAddress.toString(),
            gifLink: this.props.gifLink.toString(),
            upvoteCount: this.props.upvoteCount,
            downvoteCount: this.props.downvoteCount,
        });
    }

    incrementUpvoteCount() {
        this.setState(prevState => ({
            upvoteCount: prevState.upvoteCount += 1
        }));
        console.log("Upvote count incremented...");
    }

    incrementDownvoteCount() {
        this.setState(prevState => ({
            downvoteCount: prevState.downvoteCount += 1
        }));
        console.log("Downvote count incremented...");
    }

    render() {
        return (
            <div className="gif-item">
                <div className="gif-item-content">
                    <small className="gif-user-address">User address: {this.props.userAddress.toString()}</small>
                    <img src={this.props.gifLink.toString()} />
                </div>
                <div className="gif-vote-container">
                    <button className="gif-upvote-button" onClick={this.incrementUpvoteCount}>⬆ {this.state.upvoteCount}</button>
                    <button className="gif-downvote-button" onClick={this.incrementDownvoteCount}>⬇ {this.state.downvoteCount}</button>
                </div>
            </div>
        )
    }
}

export default GifItem;