const React = require('react');
const ReactDOM = require('react-dom');

const Result = React.createClass({
  propTypes: {
  },
  getDefaultProps () {
    return {
    };
  },
  getInitialState () {
    return {
    };
  },

  componentDidMount () {
    
  },

  handleTitleClick(title) {
    window.open(title, '_blank');
  },

  handleUserClick(user) {
    window.open(user, '_blank');
  },

  handleResultClick(url){
    this.props.handleSong({index: this.props.index, permalink_url: url});
  },

  render () {
    const { permalink_url, genre, description, title, artwork_url, waveform_url, user } = this.props;


    const imageUrl = artwork_url ? artwork_url : waveform_url;
    return (
      <div 
        ref='result' 
        className='result-container'
        onClick={() => this.handleResultClick(permalink_url)}>
        <div className='image-container'>
          <img className='song-image' src={imageUrl} />
        </div>
        <div className='details'>
          <p className='details-title' onClick={() => this.handleTitleClick(permalink_url)}>{title}</p>
        </div>
      </div>
    );
  }
});

module.exports = Result;
