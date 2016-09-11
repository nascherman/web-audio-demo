const React = require('react');
const ReactDOM = require('react-dom');
const Result = require('./Result');

const Results = React.createClass({
  propTypes: {
  },
  getDefaultProps () {
    return {
      results: []
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
        ref='results' 
        className='results-container'>
        {
          this.props.results.map((res, i) => {
            return (
              <Result
                key={i}
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
