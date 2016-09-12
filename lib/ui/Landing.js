const React = require('react');
const ReactDOM = require('react-dom');

const Scene = require('./Scene');
const Background = require('./Background');
const Search = require('./Search');
const Results = require('./Results');
const Hamburger = require('./Hamburger');
const gsap = require('gsap');

const search = require('../util/soundcloud-api').search;

let initial = false;

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
      toggle: true,
      song: {
        permalink_url: 'https://soundcloud.com/yevrs00/api5kehrvdwc'
      }
    };
  },

  animate(toggle) {
    if(toggle) {
      this.animateIn();
    }
    else {
      this.animateOut();
    }
  },

  animateInSearch(cb) {
    let search = ReactDOM.findDOMNode(this.refs.search);
    let searchFrom = {
      css: {
        marginLeft: '200vw',
      }
    };
    let searchTo = {
      css: {
        marginLeft: '5vw'
      },
      ease: gsap.Expo.easeOut,
      onComplete: cb
    };
    gsap.fromTo(search, 0.5, searchFrom, searchTo)
  },

  animateOutSearch(cb) {
    let search = ReactDOM.findDOMNode(this.refs.search);
    let searchFrom = {
      css: {
        marginLeft: '5vw',
      }
    };
    let searchTo = {
      css: {
        marginLeft: '200vw'
      },
      ease: gsap.Expo.easeOut
    };
    gsap.fromTo(search, 0.5, searchFrom, searchTo);
  },

  animateInResults(cb) {
    let results = ReactDOM.findDOMNode(this.refs.results);
    let resultsFrom = {
      css: {
        paddingLeft: '200vw'
      }
    }
    let resultsTo = {
      css: {
        paddingLeft: '5vw'
      },
      ease: gsap.Expo.easeOut,
    }

    if(this.state.results.length > 0) {
      gsap.fromTo(results, 0.6, resultsFrom, resultsTo);  
    }
  },

  animateOutResults(cb) {
    let results = ReactDOM.findDOMNode(this.refs.results);
    let resultsFrom = {
      css: {
        paddingLeft: '5vw'
      }
    }
    let resultsTo = {
      css: {
        paddingLeft: '200vw'
      },
      ease: gsap.Expo.easeOut,
    } 
    gsap.fromTo(results, 0.5, resultsFrom, resultsTo);
  },

  animateIn() {
    this.animateInSearch(this.animateInResults);      
  },

  animateOut() {
    this.animateOutSearch();
    this.animateOutResults();
  },

  componentDidMount () {
    this.animateIn();
  },

  componentWillUpdate(nextProps, nextState) {
    if(nextState.toggle !== this.state.toggle) {
      this.animate(nextState.toggle);
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if(prevState.results.length === 0 && this.state.results.length > 0) {
      this.animateInResults();
    }
  },

  updateResults (term) {
    let _this = this;
    search(term, (results) => {
      _this.indexResults(results);
      _this.setState({results})
    });
  },

  indexResults (results) {
    results.forEach((res, i) => {
      res.index = i;
    });
  },

  handleToggle () {
    console.log(!this.state.toggle);
    this.setState({toggle: !this.state.toggle});
  },

  handleSong (song) {
    let _this = this;
    let tempResults = this.state.results.slice(song.index, this.state.results.length -1);
    this.setState({song, toggle: !this.state.toggle, results: tempResults});
  },

  dispatchSong () {
    let tempResults = this.state.results.slice(1, this.state.results.length -1);
    if (tempResults.length > 0) {
      let song = {
        permalink_url: tempResults[0].permalink_url
      };
      this.setState({song, results: tempResults});
    }
  },

  render () {
    return (
      <div>
        <Background />
        <Hamburger 
          toggle={this.state.toggle}
          handleToggle={this.handleToggle}
        />
        <Scene 
          song={this.state.song}
          end={this.dispatchSong}
        />
        <div>
          <Search 
            ref='search'
            updateResults={this.updateResults}
          />
          <Results 
            ref='results'
            results={this.state.results}
            handleToggle={this.handleToggle}
            handleSong={this.handleSong}
          />
        </div>
      </div>
    );
  }
});

module.exports = Landing;
