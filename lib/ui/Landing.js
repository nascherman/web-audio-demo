const React = require('react');
const ReactDOM = require('react-dom');

const Scene = require('./Scene');
const Background = require('./Background');
const Search = require('./Search');
const Results = require('./Results');
const Hamburger = require('./Hamburger');
const gsap = require('gsap');

const search = require('../util/soundcloud-api').search;

const Landing = React.createClass({
  propTypes: {
  },
  getDefaultProps () {
    return {
    };
  },
  getInitialState () {
    return {
      results: [],
      toggle: false
    };
  },

  componentDidMount () {
    //
  },

  updateResults (term) {
    let _this = this;
    search(term, (results) => {
      _this.setState({results})
    });
  },

  handleToggle () {
    console.log(!this.state.toggle);
    this.setState({toggle: !this.state.toggle});
  },

  render () {
    /* 
      <Scene 
        song={this.state.selection}
      />
    */
    return (
      <div>
        <Background />
        <Hamburger 
          toggle={this.state.toggle}
          handleToggle={this.handleToggle}
        />
        <div>
          <Search 
            ref='search'
            updateResults={this.updateResults}
          />
          <Results 
            ref='results'
            results={this.state.results}
          />
        </div>
      </div>
    );
  }
});

module.exports = Landing;
