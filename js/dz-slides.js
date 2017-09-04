/* 
   This code is inspired by DZ-slides.
   <https://github.com/paulrouget/dzslides/>
*/

var Dz = {
    remoteWindows: [],
    idx: -1,
    step: 0,
    html: null,
    slides: null,
    progressBar : null,
    params: {
	autoplay: "1"
    },

    init: function() {
	document.body.className = "loaded";
	this.slides = Array.prototype.slice.call($$("#slides > section"));
	this.progressBar = $("#progress-bar");
	this.html = document.body.parentNode;
    },

    play: function() {
	$$(".slideshow-css").forEach(function(x) { x.disabled = false; });
	this.setupParams();
	this.onhashchange();
	this.setupTouchEvents();
	// Hack to wait for JS to be finished before calling onresize !
	// setTimeout(function () { this.onresize(); }, 0);
	this.onresize();
	this.setupView();
	window.onkeydown = this.onkeydown.bind(this);
	window.onresize = this.onresize.bind(this);
	window.onhashchange = this.onhashchange.bind(this);
	window.onmessage = this.onmessage.bind(this);
    },

    pause: function() {
	$$(".slideshow-css").forEach(function(x) { x.disabled = true; });
	window.onkeydown = null;
	window.onresize = null;
	window.onhashchange = null;
	window.onmessage = null;
	this.unresize();
    },

    setupParams: function() {
	var p = window.location.search.substr(1).split('&');
	p.forEach(function(e, i, a) {
	    var keyVal = e.split('=');
	    Dz.params[keyVal[0]] = decodeURIComponent(keyVal[1]);
	});
	// Specific params handling
	if (!+this.params.autoplay)
	    $$("video").forEach(function(v){ v.controls = true });
    },

    onkeydown: function(aEvent) {
	// Don't intercept keyboard shortcuts
	if (aEvent.altKey
	    || aEvent.ctrlKey
	    || aEvent.metaKey
	    || aEvent.shiftKey) {
	    return;
	}
	if ( aEvent.keyCode == 37 // left arrow
	     || aEvent.keyCode == 38 // up arrow
	     || aEvent.keyCode == 33 // page up
	   ) {
	    aEvent.preventDefault();
	    this.back();
	}
	if ( aEvent.keyCode == 39 // right arrow
	     || aEvent.keyCode == 40 // down arrow
	     || aEvent.keyCode == 34 // page down
	   ) {
	    aEvent.preventDefault();
	    this.forward();
	}
	if (aEvent.keyCode == 35) { // end
	    aEvent.preventDefault();
	    this.goEnd();
	}
	if (aEvent.keyCode == 36) { // home
	    aEvent.preventDefault();
	    this.goStart();
	}
	if (aEvent.keyCode == 32) { // space
	    aEvent.preventDefault();
	    this.toggleContent();
	}
	/*if (aEvent.keyCode == 70) { // f
	    aEvent.preventDefault();
	    this.goFullscreen();
	}*/
	if (aEvent.keyCode == 27) {
	    aEvent.preventDefault();
	    this.pause();
	}
	if (aEvent.keyCode == 79) { // o
	    aEvent.preventDefault();
	    this.toggleView();
	}
    },

    /* Touch Events */
    
    setupTouchEvents: function() {
	// This is not mature yet
	return;
	var orgX, newX;
	var tracking = false;

	var db = document.body;
	db.addEventListener("touchstart", start.bind(this), false);
	db.addEventListener("touchmove", move.bind(this), false);

	function start(aEvent) {
	    aEvent.preventDefault();
	    tracking = true;
	    orgX = aEvent.changedTouches[0].pageX;
	}

	function move(aEvent) {
	    if (!tracking) return;
	    newX = aEvent.changedTouches[0].pageX;
	    if (orgX - newX > 100) {
		tracking = false;
		this.forward();
	    } else {
		if (orgX - newX < -100) {
		    tracking = false;
		    this.back();
		}
	    }
	}
    },

    setupView: function() {
	document.body.addEventListener("click", function ( e ) {
	    if (!Dz.html.classList.contains("view")) return;
	    if (!e.target || e.target.nodeName != "SECTION") return;

	    Dz.html.classList.remove("view");
	    Dz.setCursor(Dz.slides.indexOf(e.target) + 1);
	}, false);
    },

    /* Adapt the size of the slides to the window */
    
    onresize: function() {
	var db = document.body;
	var sx = db.clientWidth / window.innerWidth;
	var sy = db.clientHeight / window.innerHeight;
	// console.log("dbcw,dbch,wiw,wih : " + db.clientWidth + ", " + window.innerWidth + ", " + db.clientHeight + ", " + window.innerHeight);
	var transform = "scale(" + (1/Math.max(sx, sy)) + ")";

	db.style.MozTransform = transform;
	db.style.WebkitTransform = transform;
	db.style.OTransform = transform;
	db.style.msTransform = transform;
	db.style.transform = transform;
    },
    
    unresize: function() {
	var db = document.body;
	db.style.MozTransform = null;
	db.style.WebkitTransform = null;
	db.style.OTransform = null;
	db.style.msTransform = null;
	db.style.transform = null;
    },

    getNotes: function(aIdx) {
	var s = $("section:nth-of-type(" + aIdx + ")");
	var d = s.$("[role='note']");
	return d ? d.innerHTML : "";
    },

    onmessage: function(aEvent) {
	var argv = aEvent.data.split(" "), argc = argv.length;
	argv.forEach(function(e, i, a) { a[i] = decodeURIComponent(e) });
	var win = aEvent.source;
	if (argv[0] === "REGISTER" && argc === 1) {
	    this.remoteWindows.push(win);
	    this.postMsg(win, "REGISTERED", document.title, this.slides.length);
	    this.postMsg(win, "CURSOR", this.idx + "." + this.step);
	    return;
	}
	if (argv[0] === "BACK" && argc === 1)
	    this.back();
	if (argv[0] === "FORWARD" && argc === 1)
	    this.forward();
	if (argv[0] === "START" && argc === 1)
	    this.goStart();
	if (argv[0] === "END" && argc === 1)
	    this.goEnd();
	if (argv[0] === "TOGGLE_CONTENT" && argc === 1)
	    this.toggleContent();
	if (argv[0] === "SET_CURSOR" && argc === 2)
	    window.location.hash = "#" + argv[1];
	if (argv[0] === "GET_CURSOR" && argc === 1)
	    this.postMsg(win, "CURSOR", this.idx + "." + this.step);
	if (argv[0] === "GET_NOTES" && argc === 1)
	    this.postMsg(win, "NOTES", this.getNotes(this.idx));
    },

    toggleContent: function() {
	// If a Video is present in this new slide, play it.
	// If a Video is present in the previous slide, stop it.
	var s = $("section[aria-selected]");
	if (s) {
	    var video = s.$("video");
	    if (video) {
		if (video.ended || video.paused) {
		    video.play();
		} else {
		    video.pause();
		}
	    }
	}
    },

    setCursor: function(aIdx, aStep) {
	// If the user change the slide number in the URL bar, jump
	// to this slide.
	aStep = (aStep != 0 && typeof aStep !== "undefined") ? "." + aStep : ".0";
	window.location.hash = "#" + aIdx + aStep;
    },
    
    onhashchange: function() {
	var cursor = window.location.hash.split("#"),
	newidx = 1,
	newstep = 0;
	if (cursor.length == 2) {
	    newidx = ~~cursor[1].split(".")[0];
	    newstep = ~~cursor[1].split(".")[1];
	    if (newstep > Dz.slides[newidx - 1].$$('.incremental > *').length) {
		newstep = 0;
		newidx++;
	    }
	}
	this.setProgress(newidx, newstep);
	if (newidx != this.idx) {
	    this.setSlide(newidx);
	}
	if (newstep != this.step) {
	    this.setIncremental(newstep);
	}
	for (var i = 0; i < this.remoteWindows.length; i++) {
	    this.postMsg(this.remoteWindows[i], "CURSOR", this.idx + "." + this.step);
	}
    },

    back: function() {
	if (this.idx == 1 && this.step == 0) {
	    return;
	}
	if (this.step == 0) {
	    this.setCursor(this.idx - 1,
			   this.slides[this.idx - 2].$$('.incremental > *').length);
	} else {
	    this.setCursor(this.idx, this.step - 1);
	}
    },

    forward: function() {
	if (this.idx >= this.slides.length &&
	    this.step >= this.slides[this.idx - 1].$$('.incremental > *').length) {
	    return;
	}
	if (this.step >= this.slides[this.idx - 1].$$('.incremental > *').length) {
	    this.setCursor(this.idx + 1, 0);
	} else {
	    this.setCursor(this.idx, this.step + 1);
	}
    },

    goStart: function() {
	this.setCursor(1, 0);
    },

    goEnd: function() {
	var lastIdx = this.slides.length;
	var lastStep = this.slides[lastIdx - 1].$$('.incremental > *').length;
	this.setCursor(lastIdx, lastStep);
    },

    toggleView: function() {
	this.html.classList.toggle("view");

	if (this.html.classList.contains("view")) {
	    $("section[aria-selected]").scrollIntoView(true);
	}
    },

    setSlide: function(aIdx) {
	this.idx = aIdx;
	var old = $("section[aria-selected]");
	var next = $("section:nth-of-type("+ this.idx +")");
	if (old) {
	    old.removeAttribute("aria-selected");
	    var video = old.$("video");
	    if (video) {
		video.pause();
	    }
	}
	if (next) {
	    this.html.setAttribute("data-slide", this.idx);
	    next.setAttribute("aria-selected", "true");
	    if (this.html.classList.contains("view")) {
		next.scrollIntoView();
	    }
	    var video = next.$("video");
	    if (video && !!+this.params.autoplay) {
		video.play();
	    }
	} else {
	    // That should not happen
	    this.idx = -1;
	    // console.warn("Slide doesn't exist.");
	}
    },

    setIncremental: function(aStep) {
	this.step = aStep;
	this.html.setAttribute("data-incremental", this.step);
	var old = this.slides[this.idx - 1].$('.incremental > *[aria-selected]');
	if (old) {
	    old.removeAttribute('aria-selected');
	}
	var incrementals = $$('.incremental');
	if (this.step <= 0) {
	    incrementals.forEach(function(aNode) {
		aNode.removeAttribute('active');
	    });
	    return;
	}
	var next = this.slides[this.idx - 1].$$('.incremental > *')[this.step - 1];
	if (next) {
	    next.setAttribute('aria-selected', true);
	    next.parentNode.setAttribute('active', true);
	    var found = false;
	    incrementals.forEach(function(aNode) {
		if (aNode != next.parentNode)
		    if (found)
			aNode.removeAttribute('active');
		else
		    aNode.setAttribute('active', true);
		else
		    found = true;
	    });
	} else {
	    setCursor(this.idx, 0);
	}
	return next;
    },

    goFullscreen: function() {
	var html = $('html'),
	requestFullscreen = html.requestFullscreen || html.requestFullScreen || html.mozRequestFullScreen || html.webkitRequestFullScreen;
	if (requestFullscreen) {
	    requestFullscreen.apply(html);
	}
    },

    setProgress: function(aIdx, aStep) {
	var slide = $("section:nth-of-type("+ aIdx +")");
	if (!slide)
	    return;
	var steps = slide.$$('.incremental > *').length + 1,
	slideSize = 100 / (this.slides.length - 1),
	stepSize = slideSize / steps;
	this.progressBar.style.width = ((aIdx - 1) * slideSize + aStep * stepSize) + '%';
    },

    postMsg: function(aWin, aMsg) { // [arg0, [arg1...]]
	aMsg = [aMsg];
	for (var i = 2; i < arguments.length; i++)
	    aMsg.push(encodeURIComponent(arguments[i]));
	aWin.postMessage(aMsg.join(" "), "*");
    }
};

window.addEventListener('load',
			function() {
			    Dz.init();
			     // setTimeout(function() {
			     // 	Dz.play();
			     // 	setTimeout(function () { Dz.onresize(); }, 100);
			     // }, 0);
			}, false);
