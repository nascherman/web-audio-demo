const React = require('react');
const ReactDOM = require('react-dom');
const Result = require('./Result');

const Results = React.createClass({
  getDefaultProps () {
    return {
      results: []
    };
  },

  render () {
    const { handleSong } = this.props;
    return (
      <div 
        ref='results' 
        className='results-container'>
        {
          this.props.results.map((res, i) => {
            return (
              <Result
                key={i}
                handleSong={handleSong}
                {...res}
              />
            )
          })
        }
      </div>
    );
  }
});

module.exports = Results;
