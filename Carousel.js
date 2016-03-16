'use strict';

var React = require('react-native');
var {
  Dimensions,
  StyleSheet,
  View,
  Text,
  ScrollView,
  } = React;

var TimerMixin = require('react-timer-mixin');

var { width, height } = Dimensions.get('window');

var Carousel = React.createClass({
  mixins: [TimerMixin],

  willUnmountSoon:false,

  getDefaultProps() {
    return {
      hideIndicators: false,
      indicatorColor: '#000000',
      indicatorSize: 50,
      inactiveIndicatorColor: '#999999',
      indicatorAtBottom: true,
      indicatorOffset: 250,
      width: width,
      initialPage: 0,
      indicatorSpace: 25,
      animate: true,
      delay: 1000,
      loop: true,
    };
  },

  getInitialState() {
    return {
      activePage: 0,
      width:width,
    };
  },

  componentDidMount() {

    this.willUnmountSoon = false;

    if (this.props.initialPage > 0) {
      var width = this.props.initialPage * this.state.width;
      this.setState({
        activePage: this.props.initialPage
      });
      this.refs.scrollView.scrollWithoutAnimationTo(0, width);
    }

    if (this.props.animate && this.props.children){
      this._setUpTimer();
    }
  },

  componentWillUnmount() {
    this.willUnmountSoon = true;

  },

  resizeCarousel({ width, height }){
    if ( ! this.willUnmountSoon ) {
      this.setState({width});
    }
  },

  indicatorPressed(activePage){
    this.setState({activePage});
    this.refs.scrollView.scrollTo(0, activePage * this.state.width);
  },

  _setUpTimer() {
    if (this.props.children.length > 1) {
      this.clearTimeout(this.timer);
      this.timer = this.setTimeout(this._animateNextPage, this.props.delay);
    }
  },

  _animateNextPage() {
    var activePage = 0;
    if (this.state.activePage < this.props.children.length - 1) {
      activePage = this.state.activePage + 1;
    } else if (!this.props.loop) {
      return;
    }

    this.indicatorPressed(activePage);
    this._setUpTimer();
  },

  _onAnimationBegin(e) {
    this.clearTimeout(this.timer);
  },

  _onAnimationEnd(e) {
    var activePage = e.nativeEvent.contentOffset.x / this.state.width;

    this.setState({activePage});

    if (this.props.onPageChange) {
      this.props.onPageChange(activePage);
    }
    this._setUpTimer();
  },

  renderChildren() {
    var children = [];
    for (var i = 0, l = this.props.children.length; i < l; i++) {
      children.push(<View key={i} style={[styles.page, { width:this.state.width }]} >{this.props.children[i]}</View>);
    }

    return  children;
  },

  renderPageIndicator() {
    if (this.props.hideIndicators === true) {
      return null;
    }

    var indicators = [],
      indicatorStyle = this.props.indicatorAtBottom ? { bottom: this.props.indicatorOffset } : { top: this.props.indicatorOffset },
      style, position, cLength = this.props.children.length;

    position = { width: (cLength * this.props.indicatorSpace) + (cLength * this.props.indicatorSize)};
    position.left = (this.state.width - position.width) / 2;
    for (var i = 0; i < cLength; i++) {
      style = i === this.state.activePage ? { color: this.props.indicatorColor } : { color: this.props.inactiveIndicatorColor };
      style.marginRight = style.marginLeft = this.props.indicatorSpace ? this.props.indicatorSpace/2 : 0;
      indicators.push(<Text style={[style, { fontSize: this.props.indicatorSize }]} key={i} onPress={this.indicatorPressed.bind(this,i)}>&bull;</Text>);
    }

    return (
      <View style={[styles.pageIndicator, position, indicatorStyle]}>
        {indicators}
      </View>
    );
  },

  render() {


    return (
      <View style={{flex:1}} onLayout={(event) => { this.resizeCarousel(event.nativeEvent.layout) }} >
        <ScrollView
          ref="scrollView"
          style={{flex:1}}
          contentContainerStyle={styles.container}
          automaticallyAdjustContentInsets={false}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScrollBeginDrag={this._onAnimationBegin}
          onMomentumScrollEnd={this._onAnimationEnd}
          scrollsToTop={false}
        >
          {this.renderChildren()}
        </ScrollView>
        {this.renderPageIndicator()}
      </View>
    );
  }

});
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  page:{
    flex:1,
    backgroundColor:'transparent'
  },
  pageIndicator: {
    position:'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent:'center',
    backgroundColor:'transparent',
  },
});

module.exports = Carousel;