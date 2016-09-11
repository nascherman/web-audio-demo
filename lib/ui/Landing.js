const React = require('react');
const ReactDOM = require('react-dom');

const Scene = require('./Scene');
const Background = require('./Background');
const Search = require('./Search');
const Results = require('./Results');
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
    };
  },

  componentDidMount () {
    
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
        <Search 
          updateResults={this.updateResults}
        />
        <Results 
          results={this.state.results}
        />
      </div>
    );
  }
});

module.exports = Landing;
