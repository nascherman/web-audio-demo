const React = require('react');
const ReactDOM = require('react-dom');

const noop = () => {};

const Hamburger = React.createClass({
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
        ref='hamburger' 
        className='hamburger'
        onClick={this.props.handleToggle}
      >
      </div>
    );
  }
});

module.exports = Hamburger;
