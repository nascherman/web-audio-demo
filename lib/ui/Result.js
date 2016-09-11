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

  render () {
    return (
      <div 
        ref='result' 
        className='result-container'>
        {'Some text here'}
      </div>
    );
  }
});

module.exports = Result;
