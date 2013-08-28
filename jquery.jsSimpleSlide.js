/**
 * jsSimpleSlide
 *
 * This is a very super basic content scroller for horizontal content.
 * I wrote this plugin since a lot of other sliders didn't work instantly.
 *
 * @author Konsultaner GmbH & Co. KG - Richard Burkhardt
 * @version 0.0.2
 **/
(function($){

    var settings = {
        autoplay : true,
        easing: "linear",
        duration : 800,
        height : "100px",
        pauseOnHover : true
    };

    var methods = {
        init : function(options) {
            //clone setting object for multiple use
            var _settings = $.extend(true, {}, settings);

            if (options != undefined) {
                $.extend( _settings, options );
            }

            return this.each(function(){
                if(!$(this).is("ul")){
                    methods.throwError(2);
                }
                var data = $(this).data("jsSimpleSlide");
                //no initialization has been done
                if(!data){
                    $(this).data("settings",_settings);
                    $(this).data("jsSimpleSlide",$(this));

                    // BUILD THE TEMPLATE
                    $(this).wrap("<div class='content-scroller'></div>");
                    $(this).addClass("content-scroller-body");
                    $(this).children().addClass("content-scroller-element");

                    // APPLY CSS
                    $(this).css({
                        width: "20000em",
                        position: "absolute",
                        "list-style": "none",
                        margin: 0,
                        padding: 0
                    });
                    $(this).children().css({
                        float: "left"
                    });
                    $(this).closest(".content-scroller").css({
                        position: "relative",
                        overflow: "hidden",
                        height: _settings.height
                    });

                    // needed so that hitting the next or previous button will not conflict the autoplay or the animation
                    $(this).data("navigating",false);
                    var self = $(this);

                    if(_settings.autoplay){
                        methods.play.apply($(this));
                    }

                    $(this).parent().on("mouseenter",function(){
                        if(_settings.pauseOnHover){
                            methods.pause.apply(self);
                        }
                    });

                    $(this).parent().on("mouseleave",function(){
                        if(_settings.pauseOnHover){
                            methods.play.apply(self);
                        }
                    });

                }else{
                    methods.throwError(1);
                }
            });
        },

        /**
         * option
         *
         * Lets you change the the an option at runtime
         *
         *      $(".slider").jsSimpleSlide("option","easing","linear");
         *
         * These are the possible options
         *
         *      {
         *           autoplay : true, // starts the auto play on initialization
         *           easing: "linear", // the easing for the image movements
         *           duration : 800, // the duration between the transitions
         *           height : "100px", // the slider height
         *           pauseOnHover : true // if the user hovers the slider the auto play will stop autoply until the mouse leaves the slider
         *       }
         *
         * @param {String} option The option setting that is to be changed
         * @param {*} value The value to set
         * @return {*} The current Simple Slider Object
         */
        option : function (option, value){
            if(value == undefined){
                return this.data("settings")[option];
            }else{
                this.data("settings")[option] = value;
                return this;
            }
        },

        /**
         * pause
         *
         * Pausees the autoplay
         *
         *      $(".slider").destroy("pause");
         *
         * @return {*} The current Simple Slider Object
         */
        pause: function(){
            clearInterval($(this).data("autoScrollTimer"));
        },

        /**
         * play
         *
         * Starts the autoplay
         *
         *      $(".slider").destroy("play");
         *
         * @return {*} The current Simple Slider Object
         */
        play: function(){
            var self = $(this);
            if($(this).data("autoScrollTimer")){
                methods.pause.apply(self);
            }
            $(this).data("autoScrollTimer",window.setInterval(function(){
                methods.navRight.apply(self);
            },3000));

            return $(this);
        },

        /**
         * navRight
         *
         * Navigates the slider to the left
         *
         *      $(".slider").destroy("navRight");
         *
         * @return {*} The current Simple Slider Object
         */
        navRight : function(){
            if(!$(this).data("navigating")){
                $(this).data("navigating",true);
                var firstElement = $(this).children().first(),
                    self = $(this),
                    scroller = $(this).parent();

                scroller.animate({
                        scrollLeft:firstElement.outerWidth(true,true)
                    },
                    {
                        complete:function(){
                            firstElement.detach()
                            scroller.scrollLeft(0);
                            firstElement.appendTo(self);
                            firstElement.css({opacity:0}).stop(true,true).animate({opacity:1});
                            self.data("navigating",false);
                        },
                        duration: self.data("settings").duration,
                        easing: self.data("settings").easing
                    }
                )
            }
            return $(this);
        },

        /**
         * navLeft
         *
         * Navigates the slider to the left
         *
         *      $(".slider").destroy("navLeft");
         *
         * @return {*} The current Simple Slider Object
         */
        navLeft : function(){
            if(!$(this).data("navigating")){
                $(this).data("navigating",true);
                var lastElement = $(this).children().last(),
                    self = $(this),
                    scroller = $(this).parent();

                scroller.scrollLeft(lastElement.outerWidth(true,true));
                lastElement.prependTo(self);
                scroller.animate({
                        scrollLeft:0
                    },{
                        complete:function(){
                            self.data("navigating",false);
                        },
                        duration: self.data("settings").duration,
                        easing: self.data("settings").easing
                    }
                )
            }
            return $(this);
        },

        /**
         * destroy
         *
         * Destroys The plugin
         *
         *      $(".slider").destroy("destroy");
         *
         * @return {*} The current Simple Slider Object
         */
        destroy: function(){
            methods.pause.apply($(this));
            $(this).removeData();
            $(this).unwrap();
            $(this).removeClass("content-scroller-body");
            $(this).children().removeClass("content-scroller-element")
            return $(this);
        },

        /**
         * throwError
         *
         * Lets you throw an error by error number
         *
         *      $(".slider").jsSimpleSlide("throwError",1);
         *
         * @param {int} errno The error that is to be thrown
         * @return {*} The current Simple Slider Object
         */
        throwError : function(errno){
            var error = "";
            if(errno != undefined){
                if(errno == 1){
                    error = "This Objekt has already been initialized!";
                }else if(errno == 2){
                    error = "Only ul elements can be initialized";
                }else{
                    error = "Unknown Error";
                }
            }else{
                error = "Unknown Error";
            }

            if(window.console) {
                console.log(error);
            } else {
                alert(error);
            }

            return this;
        }

    };

    $.fn.jsSimpleSlide = function(method) {
        if ( methods[method] ) {
            return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply(this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.jsSimpleSlide' );
        }
    };

})(jQuery);
