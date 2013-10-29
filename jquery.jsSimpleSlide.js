/**
 * jsSimpleSlide
 *
 * This is a very super basic content scroller for horizontal content.
 * I wrote this plugin since a lot of other sliders didn't work instantly.
 *
 * @author Konsultaner GmbH & Co. KG - Richard Burkhardt
 * @version 0.0.4
 **/
(function($){

    var settings = {
        autoplay : true,
        easing: "linear",
        duration : 800,
        pauseTime : 3000,
        height : "100px",
        pauseOnHover : true,
        navigateOnClick : false
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

                    // needed so that hitting the next or previous button will not conflict the auto play or the animation
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

                    if(_settings.navigateOnClick){
                        $(this).children().css({cursor:"pointer"});
                        $(this).on("click.jsSimpleSlide"," > *",function(){
                            methods.navRight.apply(self,[$(this).prevAll().length]);
                        });
                    }

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
         *           duration : 800, // the time the transition takes
         *           pauseTime : 3000, // the pause time between the transitions
         *           height : "100px", // the slider height
         *           pauseOnHover : true // if the user hovers the slider the auto play will stop autoply until the mouse leaves the slider
         *           navigateOnClick : false // if the user clicks on one of the content elements the slider will scroll to that element
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
         * Pauses the autoplay
         *
         *      $(".slider").jsSimpleSlide("pause");
         *
         * @return {*} The current Simple Slider Object
         */
        pause: function(){
            $(this).trigger("pause");
            clearInterval($(this).data("autoScrollTimer"));
        },

        /**
         * play
         *
         * Starts the autoplay
         *
         *      $(".slider").jsSimpleSlide("play");
         *
         * @return {*} The current Simple Slider Object
         */
        play: function(){
            $(this).trigger("play");
            var self = $(this);
            if($(this).data("autoScrollTimer")){
                methods.pause.apply(self);
            }
            $(this).data("autoScrollTimer",window.setInterval(function(){
                methods.navRight.apply(self);
            },this.data("settings").pauseTime));

            return $(this);
        },

        /**
         * navRight
         *
         * Navigates the slider to the left, triggers the startNavRight event
         *
         *      $(".slider").destroy("navRight",steps,duration);
         *
         * @param {int} steps the amount of navigation cycles to be done
         * @param {int} duration overwrite the duration set in the settings
         * @return {*} The current Simple Slider Object
         */
        navRight : function(steps,duration){
            if(typeof steps == "undefined"){
                steps = 1;
                if(typeof duration == "undefined"){
                    duration = $(this).data("settings").duration / steps;
                }
            }

            $(this).trigger({type:"startNavRight",steps:steps,duration:duration});

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
                            firstElement.css({opacity:0}).stop(true,true).animate({opacity:1},{duration:duration/3});
                            self.data("navigating",false);
                            if(steps > 1){
                                steps--;
                                methods.navRight.apply(self,[steps,duration]);
                            }
                        },
                        duration: duration,
                        easing: self.data("settings").easing
                    }
                )
            }
            return $(this);
        },

        /**
         * navLeft
         *
         * Navigates the slider to the left, triggers the startNavLeft event
         *
         *      $(".slider").destroy("navLeft");
         *
         * @param {int} steps the amount of navigation cycles to be done
         * @param {int} duration overwrite the duration set in the settings
         * @return {*} The current Simple Slider Object
         */
        navLeft : function(steps,duration){
            if(typeof steps == "undefined"){
                steps = 1;
                if(typeof duration == "undefined"){
                    duration = $(this).data("settings").duration / steps;
                }
            }

            $(this).trigger({type:"startNavLeft",steps:steps,duration:duration});

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
                            if(steps > 1){
                                steps--;
                                methods.navRight.apply(self,[steps,duration]);
                            }
                        },
                        duration: duration,
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
