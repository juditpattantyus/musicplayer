
	AUTHOR: Osvaldas Valutis, www.osvaldas.info


(function($, window, document, undefined) {
    var isTouch = "ontouchstart" in window,
        eStart = isTouch ? "touchstart" : "mousedown",
        eMove = isTouch ? "touchmove" : "mousemove",
        eEnd = isTouch ? "touchend" : "mouseup",
        eCancel = isTouch ? "touchcancel" : "mouseup",
        secondsToTime = function(secs) {
            var hours = Math.floor(secs / 3600),
                minutes = Math.floor((secs % 3600) / 60),
                seconds = Math.ceil((secs % 3600) % 60);
            return (
                (hours == 0
                    ? ""
                    : hours > 0 && hours.toString().length < 2
                      ? "0" + hours + ":"
                      : hours + ":") +
                (minutes.toString().length < 2 ? "0" + minutes : minutes) +
                ":" +
                (seconds.toString().length < 2 ? "0" + seconds : seconds)
            );
        },
        canPlayType = function(file) {
            var audioElement = document.createElement("audio");
            return !!(
                audioElement.canPlayType &&
                audioElement
                    .canPlayType(
                        "audio/" +
                            file
                                .split(".")
                                .pop()
                                .toLowerCase() +
                            ";"
                    )
                    .replace(/no/, "")
            );
        };

    $.fn.audioPlayer = function(params) {
        var params = $.extend(
                {
                    classPrefix: "audioplayer",
                    strPlay: "Play",
                    strPause: "Pause",
                    strVolume: "Volume"
                },
                params
            ),
            cssClass = {},
            cssClassSub = {
                playPause: "playpause",
                playing: "playing",
                time: "time",
                timeCurrent: "time-current",
                timeDuration: "time-duration",
                bar: "bar",
                barLoaded: "bar-loaded",
                barPlayed: "bar-played",
                volume: "volume",
                volumeButton: "volume-button",
                volumeAdjust: "volume-adjust",
                noVolume: "novolume",
                mute: "mute",
                mini: "mini"
            };

        for (var subName in cssClassSub)
            cssClass[subName] = params.classPrefix + "-" + cssClassSub[subName];

        this.each(function() {
            if (
                $(this)
                    .prop("tagName")
                    .toLowerCase() != "audio"
            )
                return false;

            var $this = $(this),
                audioFile = $this.attr("src"),
                isAutoPlay = $this.get(0).getAttribute("autoplay"),
                isAutoPlay =
                    isAutoPlay === "" || isAutoPlay === "autoplay"
                        ? true
                        : false,
                isLoop = $this.get(0).getAttribute("loop"),
                isLoop = isLoop === "" || isLoop === "loop" ? true : false,
                isSupport = false;

            if (typeof audioFile === "undefined") {
                $this.find("source").each(function() {
                    audioFile = $(this).attr("src");
                    if (
                        typeof audioFile !== "undefined" &&
                        canPlayType(audioFile)
                    ) {
                        isSupport = true;
                        return false;
                    }
                });
            } else if (canPlayType(audioFile)) isSupport = true;

            var thePlayer = $(
                    '<div class="' +
                        params.classPrefix +
                        '">' +
                        (isSupport
                            ? $("<div>")
                                  .append($this.eq(0).clone())
                                  .html()
                            : '<embed src="' +
                              audioFile +
                              '" width="0" height="0" volume="100" autostart="' +
                              isAutoPlay.toString() +
                              '" loop="' +
                              isLoop.toString() +
                              '" />') +
                        '<div class="' +
                        cssClass.playPause +
                        '" title="' +
                        params.strPlay +
                        '"><a href="#">' +
                        params.strPlay +
                        "</a></div></div>"
                ),
                theAudio = isSupport
                    ? thePlayer.find("audio")
                    : thePlayer.find("embed"),
                theAudio = theAudio.get(0);

            if (isSupport) {
                thePlayer
                    .find("audio")
                    .css({ width: 0, height: 0, visibility: "hidden" });
                thePlayer.append(
                    '<div class="' +
                        cssClass.time +
                        " " +
                        cssClass.timeCurrent +
                        '"></div><div class="' +
                        cssClass.bar +
                        '"><div class="' +
                        cssClass.barLoaded +
                        '"></div><div class="' +
                        cssClass.barPlayed +
                        '"></div></div><div class="' +
                        cssClass.time +
                        " " +
                        cssClass.timeDuration +
                        '"></div><div class="' +
                        cssClass.volume +
                        '"><div class="' +
                        cssClass.volumeButton +
                        '" title="' +
                        params.strVolume +
                        '"><a href="#">' +
                        params.strVolume +
                        '</a></div><div class="' +
                        cssClass.volumeAdjust +
                        '"><div><div></div></div></div></div>'
                );

                var theBar = thePlayer.find("." + cssClass.bar),
                    barPlayed = thePlayer.find("." + cssClass.barPlayed),
                    barLoaded = thePlayer.find("." + cssClass.barLoaded),
                    timeCurrent = thePlayer.find("." + cssClass.timeCurrent),
                    timeDuration = thePlayer.find("." + cssClass.timeDuration),
                    volumeButton = thePlayer.find("." + cssClass.volumeButton),
                    volumeAdjuster = thePlayer.find(
                        "." + cssClass.volumeAdjust + " > div"
                    ),
                    volumeDefault = 0,
                    adjustCurrentTime = function(e) {
                        theRealEvent = isTouch ? e.originalEvent.touches[0] : e;
                        theAudio.currentTime = Math.round(
                            theAudio.duration *
                                (theRealEvent.pageX - theBar.offset().left) /
                                theBar.width()
                        );
                    },
                    adjustVolume = function(e) {
                        theRealEvent = isTouch ? e.originalEvent.touches[0] : e;
                        theAudio.volume = Math.abs(
                            (theRealEvent.pageY -
                                (volumeAdjuster.offset().top +
                                    volumeAdjuster.height())) /
                                volumeAdjuster.height()
                        );
                    },
                    updateLoadBar = setInterval(function() {
                        barLoaded.width(
                            theAudio.buffered.end(0) / theAudio.duration * 100 +
                                "%"
                        );
                        if (theAudio.buffered.end(0) >= theAudio.duration)
                            clearInterval(updateLoadBar);
                    }, 100);

                var volumeTestDefault = theAudio.volume,
                    volumeTestValue = (theAudio.volume = 0.111);
                if (
                    Math.round(theAudio.volume * 1000) / 1000 ==
                    volumeTestValue
                )
                    theAudio.volume = volumeTestDefault;
                else thePlayer.addClass(cssClass.noVolume);

                timeDuration.html("&hellip;");
                timeCurrent.text(secondsToTime(0));

                theAudio.addEventListener("loadeddata", function() {
                    timeDuration.text(secondsToTime(theAudio.duration));
                    volumeAdjuster
                        .find("div")
                        .height(theAudio.volume * 100 + "%");
                    volumeDefault = theAudio.volume;
                });

                theAudio.addEventListener("timeupdate", function() {
                    timeCurrent.text(secondsToTime(theAudio.currentTime));
                    barPlayed.width(
                        theAudio.currentTime / theAudio.duration * 100 + "%"
                    );
                });

                theAudio.addEventListener("volumechange", function() {
                    volumeAdjuster
                        .find("div")
                        .height(theAudio.volume * 100 + "%");
                    if (
                        theAudio.volume > 0 &&
                        thePlayer.hasClass(cssClass.mute)
                    )
                        thePlayer.removeClass(cssClass.mute);
                    if (
                        theAudio.volume <= 0 &&
                        !thePlayer.hasClass(cssClass.mute)
                    )
                        thePlayer.addClass(cssClass.mute);
                });

                theAudio.addEventListener("ended", function() {
                    thePlayer.removeClass(cssClass.playing);
                });

                theBar
                    .on(eStart, function(e) {
                        adjustCurrentTime(e);
                        theBar.on(eMove, function(e) {
                            adjustCurrentTime(e);
                        });
                    })
                    .on(eCancel, function() {
                        theBar.unbind(eMove);
                    });

                volumeButton.on("click", function() {
                    if (thePlayer.hasClass(cssClass.mute)) {
                        thePlayer.removeClass(cssClass.mute);
                        theAudio.volume = volumeDefault;
                    } else {
                        thePlayer.addClass(cssClass.mute);
                        volumeDefault = theAudio.volume;
                        theAudio.volume = 0;
                    }
                    return false;
                });

                volumeAdjuster
                    .on(eStart, function(e) {
                        adjustVolume(e);
                        volumeAdjuster.on(eMove, function(e) {
                            adjustVolume(e);
                        });
                    })
                    .on(eCancel, function() {
                        volumeAdjuster.unbind(eMove);
                    });
            } else thePlayer.addClass(cssClass.mini);

            if (isAutoPlay) thePlayer.addClass(cssClass.playing);

            thePlayer.find("." + cssClass.playPause).on("click", function() {
                if (thePlayer.hasClass(cssClass.playing)) {
                    $(this)
                        .attr("title", params.strPlay)
                        .find("a")
                        .html(params.strPlay);
                    thePlayer.removeClass(cssClass.playing);
                    isSupport ? theAudio.pause() : theAudio.Stop();
                } else {
                    $(this)
                        .attr("title", params.strPause)
                        .find("a")
                        .html(params.strPause);
                    thePlayer.addClass(cssClass.playing);
                    isSupport ? theAudio.play() : theAudio.Play();
                }
                return false;
            });

            $this.replaceWith(thePlayer);
        });
        return this;
    };

    $.fn.customAudioPlayer = function() {
        //Elements:
        var $source = $("#audiotrack")[0],
            $track = $("#track"),
            $progress = $("#progress"),
            $play = $("#play"),
            $pause = $("#pause"),
            $playPause = $("#play, #pause"),
            $stop = $("#stop"),
            $mute = $("#mute"),
            $volume = $("#volume"),
            $level = $("#level");

        //Vars:
        var totalTime, timeBar, newTime, volumeBar, newVolume, cursorX;

        var interval = null;

        //===================
        //===================
        //Track:
        //===================
        //===================

        //Progress bar:
        function barState() {
            if (!$source.ended) {
                var totalTime = parseInt(
                    $source.currentTime / $source.duration * 100
                );
                $progress.css({ width: totalTime + 1 + "%" });
            } else if ($source.ended) {
                $play.show();
                $pause.hide();
                clearInterval(interval);
            }
            console.log("playing...");
        }

        //Event trigger:
        $track.click(function(e) {
            if (!$source.paused) {
                var timeBar = $track.width();
                var cursorX = e.pageX - $track.offset().left;
                var newTime = cursorX * $source.duration / timeBar;
                $source.currentTime = newTime;
                $progress.css({ width: cursorX + "%" });
            }
        });

        //===================
        //===================
        //Button (Play-Pause):
        //===================
        //===================

        $("#pause").hide();

        function playPause() {
            if ($source.paused) {
                $source.play();
                $pause.show();
                $play.hide();
                interval = setInterval(barState, 50); //Active progress bar.
                console.log("play");
            } else {
                $source.pause();
                $play.show();
                $pause.hide();
                clearInterval(interval);
                console.log("pause");
            }
        }

        $playPause.click(function() {
            playPause();
        });

        //===================
        //===================
        //Button (Stop):
        //===================
        //===================
        function stop() {
            $source.pause();
            $source.currentTime = 0;
            $progress.css({ width: "0%" });
            $play.show();
            $pause.hide();
            clearInterval(interval);
        }

        $stop.click(function() {
            stop();
        });

        //===================
        //===================
        //Button (Mute):
        //===================
        //===================
        function mute() {
            if ($source.muted) {
                $source.muted = false;
                $mute.removeClass("mute");
                console.log("soundOFF");
            } else {
                $source.muted = true;
                $mute.addClass("mute");
                console.log("soundON");
            }
        }

        $mute.click(function() {
            mute();
        });

        //===================
        //===================
        //Volume bar:
        //===================
        //===================
        $volume.click(function(e) {
            var volumeBar = $volume.width();
            var cursorX = e.pageX - $volume.offset().left;
            var newVolume = cursorX / volumeBar;
            $source.volume = newVolume;
            $level.css({ width: cursorX + "px" });
            $source.muted = false;
            $mute.removeClass("mute");
        });
    };
})(jQuery, window, document);

$(function() {
    $(".simple audio").audioPlayer();
});
$(function() {
    $(".custom audio").customAudioPlayer();
});