const React = require('react');
const ReactDOM = require('react-dom');
const gsap = require('gsap');

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

  componentWillUpdate (nextProps, nextState) {
    if(nextProps.toggle !== this.props.toggle) {
      if(nextProps.toggle) {
        this.animateIn();
      }
      else {
        this.animateOut();
      }
    }
  },

  animateIn () {
    let arrow = ReactDOM.findDOMNode(this.refs.arrow);
    gsap.to(arrow, 0.5, { 
      rotationY: 0
    })
  },

  animateOut () {
    let arrow = ReactDOM.findDOMNode(this.refs.arrow);
    gsap.to(arrow, 0.5, { 
      rotationY: '180'
    })
  },

  render () {
    return (
      <div 
        ref='hamburger' 
        className='hamburger noselect'
        onClick={this.props.handleToggle}
      >
        <img 
          ref='arrow'
          src={this.props.arrow} 
          className='hamburger-arrow' 
        />
      </div>
    );
  }
});

module.exports = Hamburger;
