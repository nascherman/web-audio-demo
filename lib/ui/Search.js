const React = require('react');
const ReactDOM = require('react-dom');

const noop = () => {};

const Search = React.createClass({
  propTypes: {
    updateResults: React.PropTypes.func
  },

  getDefaultProps () {
    return {
    };
  },
  getInitialState () {
    return {
      results: []
    };
  },

  componentDidMount () {
    
  },


  handleKeyDown(event) {
    if(event.keyCode === 13) {
      this.props.updateResults(this.refs.input.value);
    }
  },

  render () {
    return (
      <div 
        ref='background' 
        className='search-container'>
        <input
          ref='input'
          type='text'
          placeholder='search tracks'
          className='search-input'
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
});

module.exports = Search;
