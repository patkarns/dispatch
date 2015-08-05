var React = require('react');
var LinkedList = require('../modules/LinkedList.js');
var GallerySlide = require('./GallerySlide.jsx');
var Hammer = require('hammerjs');
//var Modernizr = require('modernizr');

var Gallery = React.createClass({
    getInitialState: function(){
        return {
            active: null,
            index: false,
            image: false,
            visible: false,
            deltax: 0,
            slide_width: $(window).width()
        }
    },
    componentWillMount: function(){
        this.images = LinkedList(this.props.images);
    },
    componentDidMount: function(){

        //this.preloadImages();

        this.setupEventListeners();
        this.addSlideTrigger(this.props.trigger);
        this.initSlider();
    },
    initSlider: function(){

        var element = this.refs.gallery.getDOMNode();

        this.element = $(element);

        this.container = $("ul.slides", this.element);

        this.panes = $("li.slide", this.element);

        this.pane_width = 0;
        this.pane_height = 0;
        this.pane_count = this.panes.length;

        this.current_pane = 0;

        this.setPaneDimensions();

        $(window).on("load resize orientationchange", function() {
            this.setPaneDimensions();
            this.setState({ slide_width: $(window).width() });
          //updateOffset();
        }.bind(this));

        var hammertime = new Hammer(element, { drag_lock_to_axis: true });

        hammertime.on("tap release dragleft dragright swipeleft swiperight dragup dragdown swipeup swipedown", this.handleHammer);

        /* From Modernizr */
        function whichTransitionEvent(){
            var t;
            var el = document.createElement('fakeelement');
            var transitions = {
              'transition':'transitionend',
              'OTransition':'oTransitionEnd',
              'MozTransition':'transitionend',
              'WebkitTransition':'webkitTransitionEnd'
            }

            for(t in transitions){
                if( el.style[t] !== undefined ){
                    return transitions[t];
                }
            }
        }

        /* Listen for a transition! */
        var transitionEvent = whichTransitionEvent();
        transitionEvent && element.addEventListener(transitionEvent, function() {
            console.log('Transition complete!  This is the callback, no library needed!');
        });

    },
    setPaneDimensions: function(){
        this.pane_width = $(window).width();
        this.panes.each(function() {
          console.log(this);
          $(this).width(this.pane_width);
        });

        this.container.width(this.pane_width*this.pane_count);
    },
    updatePaneDimensions: function(){
        this.container = $("ul.slides", this.element);

        this.panes = $("li.slide", this.element);

        this.pane_width = $(window).width();

        this.panes.each(function() {
          $(this).width(this.pane_width);
        });

        var containerWidth = this.pane_width*this.panes.length;

        $(this.container).css('width', containerWidth);

        // update pane count
        this.pane_count = this.panes.length;

        // reset current pane
        this.showPane(this.current_pane, false);
    },
    showPane: function(index, animate) {
        // between the bounds
        index = Math.max(0, Math.min(index, this.pane_count-1));
        this.current_pane = index;

        var offset = -((100/this.pane_count)*this.current_pane);

        this.setContainerOffset(offset, true);
    },
    setContainerOffset: function(percent, animate){


        console.log('setting offset');
        console.log(this.pane_count);

        this.container.removeClass("animate");

        if(animate) {
          this.container.addClass("animate");
        }

        var px = ((this.pane_width * this.pane_count) / 100) * percent;

        console.log(px);

        console.log(this.container);

        //if(Modernizr.csstransforms3d) {
          this.container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
        //}
//        else if(Modernizr.csstransforms) {
//          this.container.css("transform", "translate("+ percent +"%,0)");
//        }
//        else {
//            var px = ((this.pane_width*this.pane_count) / 100) * percent;
//            this.container.css("left", px+"px");
//        }
    },
    nextSlide: function() { return this.showPane(this.current_pane+1, true); },
    prevSlide: function() { return this.showPane(this.current_pane-1, true); },
    handleHammer: function(ev) {

        console.log(ev);
        // disable browser scrolling
        //ev.preventDefault();

        switch(ev.type) {
            case 'panright':
            case 'panleft':
                console.log('dragging');
                // stick to the finger
                var pane_offset = -(100/this.pane_count) * this.current_pane;
                var drag_offset = ((100/this.pane_width) * ev.deltaX) / this.pane_count;

                // slow down at the first and last pane
                if((this.current_pane == 0  && ev.direction == Hammer.DIRECTION_RIGHT) ||
                   (this.current_pane == pane_count-1 && ev.direction == Hammer.DIRECTION_LEFT)) {
                  drag_offset *= .4;
                }

                this.setContainerOffset(drag_offset + pane_offset);
                break;

          case 'swipeleft':
            this.nextSlide();
            //ev.stopDetect();
            break;

          case 'swiperight':
            this.prevSlide();
            //ev.stopDetect();
            break;

          case 'release':
            // Left & Right
            // more then 50% moved, navigate
            if(Math.abs(ev.deltaX) > this.pane_width/2) {
              if(ev.direction == 'right') {
                this.prevSlide();
              } else {
                this.nextSlide();
              }
            }
            else {
              this.showPane(this.current_pane, true);
            }

            break;
        }
    },
    swipeSlide: function(dir){
        var pos;
        var callback = false;
        if(dir == 'next'){
            callback = this.next;
            pos = -($(window).width());
        } else if(dir == 'previous') {
            callback = this.previous;
            pos = $(window).width();
        } else {
            pos = 0;
        }

        $('.slides').animate({ left: pos }, 150, function(){
            if(callback){
                console.log('switching slides!');
                callback(function(){
                    $('.slides').css({ left: 0 });
                });
            }
        });
    },
    setupEventListeners: function(){

        // Keyboard controls
        key('left', this.previous);
        key('right', this.next);
        key('esc', this.close);

        // Arrow buttons
        $(document).on('click', '.prev-slide', function(e){
            e.preventDefault();
            this.previous();
        }.bind(this));

        $(document).on('click', '.next-slide', function(e){
            e.preventDefault();
            this.next();
        }.bind(this));

        // Clicking outside container
//        $(this.getDOMNode()).mouseup(function (e)
//        {
//            var container = $(this.getDOMNode()).find(".slide");
//            if (!container.is(e.target) && container.has(e.target).length === 0)
//            {
//                this.close();
//                $('body').removeClass('no-scroll');
//            }
//        }.bind(this));

    },
    addSlideTrigger: function(target){
        console.log('adding slide trigger for ' + target);
        $(target).on('click', function(e){
            e.preventDefault();
            var image_id = $(e.target).data("id");

            if(this.state.visible){
                this.close();
            } else {
                this.open(image_id);
            }

        }.bind(this));
    },
    setIndex: function(index){
        var attachment = this.props.images[index];
        this.setState({
            index: index,
            image: attachment.url,
            caption: attachment.caption,
        });
    },
    preloadImages: function(){
        var loaded = [];
        this.props.images.map(function(image, i){
            loaded[i] = new Image();
            loaded[i].src = image.url;
        });
    },
    getImage: function(imageId){
        var index = this.props.imagesTable[imageId];
        return this.props.images[index];
    },
    getActiveImage: function(imageId){
        console.log('finding image');
        console.log(this.images);
        var active = this.images;
        while(active){
            if(active.data.id == imageId)
                return active;
            active = active.next;
        }
        return null;
    },
    setCurrentImage: function(imageId){
        this.setState({ active: this.getActiveImage(imageId)}, this.updatePaneDimensions);
    },
    open: function(imageId){
        this.setCurrentImage(imageId);
        this.setState({ visible: true });
        $('body').addClass('no-scroll');
    },
    close: function(){
        this.setState({
            visible: false,
        });
        $('body').removeClass('no-scroll');
    },
    previous: function(callback){
        if(!this.state.active || !this.state.active.prev)
            return
        this.setState({ active: this.state.active.prev }, callback);
    },
    next: function(callback){
        if(!this.state.active || !this.state.active.next)
            return
        this.setState({ active: this.state.active.next }, callback);
    },
    renderImage: function(){
        if(this.state.image){
            var imageStyle = { maxHeight: $(window).height() - 200 };
            return (
                <div className="slide">
                    <img className="slide-image" style={imageStyle} src={this.state.image} />
                    <p className="slide-caption">{this.state.caption}</p>
                    {this.renderControls()}
                </div>
            );
        }
    },
    renderControls: function(){
        if(this.props.images.length > 1){
            return (
                <div className="navigation">
                    <a className="prev-slide" href="#"><i className="fa fa-chevron-left"></i></a>
                    <span className="curr-slide">{this.state.index + 1}</span> &nbsp;of&nbsp; <span className="total-slide">{this.props.images.length}</span>
                    <a className="next-slide" href="#"><i className="fa fa-chevron-right"></i></a>
                </div>
            );
        }
    },
    renderSlides: function(){
        //var slidesStyle = { left: -($(window).width()) + this.state.deltax };

        return (
            <div className="image-inner">
                <ul className="slides" ref="slides">
                {this.state.active.prev ? this.renderSlide(this.state.active.prev, 'prev') : this.renderBlankSlide()}
                {this.state.active ? this.renderSlide(this.state.active, 'active') : null}
                {this.state.active.next ? this.renderSlide(this.state.active.next, 'next') : this.renderBlankSlide()}
                </ul>
            </div>
            );
    },
    renderBlankSlide: function(){
        return(<div className="slide"></div>);
    },
    renderSlide: function(active, className){
        var image = active.data;
        return (<GallerySlide width={this.state.slide_width} className={className} src={image.url} caption={image.caption} />);
    },
    render: function() {
        if(this.state.visible){
            var visible = "visible";
        } else {
            var visible = "";
        }
        return (
            <div className={'slideshow ' + visible}>
                <div ref="gallery" className="image-container">
                {this.state.active ? this.renderSlides() : null}
                </div>
            </div>
        );
    }
});

module.exports = Gallery;