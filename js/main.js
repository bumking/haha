(var mainbtn = document.getElementById('main-btn');
	var onoffbtn = document.getElementById('onoff-btn');
	var setting_vibe = document.getElementById('vibe_check');
	var setting_push = document.getElementById('push_check');
	var Tempvalue = document.getElementById('Tempvalue');
	var sleepbtn = document.getElementById('sleep-btn');
	var powertext = document.getElementById('powertext');
	var onoff_con = document.getElementById('onoff_con');
	var main_con = document.getElementById('main_con');

	var currentmode = 0;
	var currentonoff = 0;
	var currentconnect = 0;

	var webSocket;
	var counter = 0;
	var HR_val = 0;
	var sleepindex = 0;

	document.getElementById('warningpopup-cancel').addEventListener('click',
			function(ev) {
				tau.closePopup();
			});

	document.getElementById('pushPopup-cancel').addEventListener('click',
			function(ev) {
				tau.closePopup();
			});
	document.getElementById('successpopup-cancel').addEventListener('click',
			function(ev) {
				tau.closePopup();
			});

	function sendMessage(msg) {
		if (webSocket.readyState === 1) {
			webSocket.send(msg);
			console.log("client message : " + msg);
		}
	}


	function gotosleep() {
		if (sleepindex == 0) {

			sendMessage("7");
		} else {

			sendMessage("8");
		}

	};
	function fine() {
		if (currentconnect != 1) {
			tau.openPopup("#warningpopup");
			if (setting_vibe.checked == true)
				navigator.vibrate(1000);
		} else {
			sendMessage("5");
			tau.openPopup("#successpopup");
			maintext.innerHTML = "CLICK!";
		}
	}


	function gotoback() {
		console.log("gotoback clicked");
		/*
		 * if (currentmode == 1) { gotomain(); } else gotoonoff();
		 */
		tau.back();

	};
	function gotosetting() {
		console.log("setting clicked");

		tau.changePage(document.getElementById("setting"));

	};

	function onchangedCB(hrm) {

		counter++;
		if (counter > 100) {
			/* Stop the sensor after detecting a few changes */
			webapis.motion.stop("HRM");
			if (hrm.heartRate < 75)
				sendMessage("soft");
			else if (hrm.heartRate >= 75 && hrm.heartRate < 100)
				sendMessage("mid");
			else if (hrm.heartRate >= 100 && hrm.heartRate < 140)
				sendMessage("hard");
			tau.closePopup();

			setInterval(function() {
				sendMessage("6");
			}, 10000);

		}
	};

	function onoffclicked() {

		if (currentconnect != 1) {
			tau.openPopup("#warningpopup");
			if (setting_vibe.checked == true)
				navigator.vibrate(1000);
		} else {
			if (currentonoff == 0) {
				currentonoff = 1;

				/* Popup closes with Cancel button click */

				sendMessage("1");

			} else {
				currentonoff = 0;
				sendMessage("2");

			}
		}
	};

	function gotoonoff() {

		currentmode = 2;
		tau.changePage(document.getElementById("onoff"));
	};

	function gotomain() {
		console.log("main clicked");

		currentmode = 1;
		tau.changePage(document.getElementById("main"));
	};

	function gotopower() {
		console.log("power clicked");

		currentmode = 3;
		tau.changePage(document.getElementById("power"));
	};


	function start() {
		console.log("button clicked");

		if (currentconnect == 1)
			tizen.application.getCurrentApplication().exit();
		else {
			tau.openPopup("#connectpopup");

			var webSocketURL = "ws://192.168.0.26:80/";
			// var webSocketURL = "ws://echo.websocket.org";

			// Define WebSocket
			webSocket = new WebSocket(webSocketURL);

			console.log("created");

			// When the WebSocket connection is established
			webSocket.onopen = function(e) {
				
				console.log('connection open, readyState : '
						+ e.target.readyState);
				tau.openPopup("#heartpopup");
				window.webapis.motion.start("HRM", onchangedCB);
				
				currentconnect = 1;
				onoff_con.innerHTML = "종료";
				main_con.innerHTML = "종료";

			};

			// When the WebSocket message has been received
			webSocket.onmessage = function(e) {
				console.log('server message : ' + e.data);

				if (e.data == "6") {
					if (setting_push.checked == true) {
						tizen.power.turnScreenOn();
						tizen.application.launch("0tO4FfDxPP.humanconditioner",
								onsuccess2);

						gotomain();
						tau.openPopup("#pushpopup");
						if (setting_vibe.checked == true)
							navigator.vibrate(2000);
					}

				} else if (e.data.indexOf("Tempvalue") != -1) {

					var start = e.data.indexOf(":");
					var end = e.data.indexOf(".");
					var target = e.data.substring(start + 1, end);
					Tempvalue.innerHTML = target;

				} else if (e.data == "SLEEP ON") {

					mainbtn.style.background = 'url(images/sleepCircle.png) transparent no-repeat center';
					sleepindex = 1;
					sleepbtn.innerHTML = "절전 모드 해제";

				} else if (e.data == "SLEEP OFF") {

					mainbtn.style.background = 'url(images/Circle.png) transparent no-repeat center';
					sleepindex = 0;
					sleepbtn.innerHTML = "절전 모드";

				} else if (e.data == "Turn on the A/C") {
					onoffbtn
							.setAttribute(
									'style',
									"top: 20px; position: relative; background: url(images/bgpoweron.png) transparent no-repeat center; background-position: center; height: 333px !important; background-size: 70%;");
					currentonoff = 1;
				} else if (e.data == "Turn off the A/C") {
					onoffbtn
							.setAttribute(
									'style',
									"top: 20px; position: relative; background: url(images/bgpoweroff.png) transparent no-repeat center; background-position: center; height: 333px !important; background-size: 70%;");
					currentonoff = 0;

				}

				if (currentmode == 3)
					powertext.innerHTML = e.data;

			};

			// When fail the WebSocket connection or the WebSocket connection is
			// closed with prejudice
			webSocket.onerror = function(e) {
				console.log('error, readyState : ' + e.target.readyState);
				currentconnect = 0;
			};

			// When the WebSonection is closed
			webSocket.onclose = function(e) {
				console.log('current readyState : ' + e.target.readyState);
				currentconnect = 0;
				onoff_con.innerHTML = "연결";
				main_con.innerHTML = "연결";
			};

			function closeConnection() {
				if (webSocket.readyState === 1) {
					webSocket.close();
				}
			}
			;

			window.onload = function() {
				document.getElementById('btnSendMessage').onclick = function(e) {
					// sendMessage("123123");
				}
			};

			console.log("you reach the end of the line");
		}
	}

	tau.event.enableGesture(mainbtn, new tau.event.gesture.Swipe({
		orientation : "vertical"
	}));

	tau.event.enableGesture(mainbtn, new tau.event.gesture.Swipe({
		orientation : "horizontal"
	}));

	tau.event.enableGesture(powertext, new tau.event.gesture.Swipe({
		orientation : "horizontal"
	}));

	tau.event.enableGesture(onoffbtn, new tau.event.gesture.Swipe({
		orientation : "horizontal"
	}));

	console.log("enable gesture");

	mainbtn.addEventListener("swipe", function(e) {
		console.log(e.detail.direction + "swipe event fired");

		if (e.detail.direction == 'left') {
			gotoonoff();
		} else {
			if (currentconnect != 1 && (e.detail.direction == 'up' || e.detail.direction == 'down')) {
				tau.openPopup("#warningpopup");
				if (setting_vibe.checked == true)
					navigator.vibrate(1000);
			} else {
				if (e.detail.direction == 'up') {

					sendMessage("3");
					tau.openPopup("#successpopup");
				} else if (e.detail.direction == 'down') {

					sendMessage("4");
					tau.openPopup("#successpopup");
				} else if (e.detail.direction == 'left')
					gotoonoff();

			}
		}
	});

	powertext.addEventListener("swipe", function(e) {
		console.log(e.detail.direction + "swipe event fired");

		if (e.detail.direction == 'right') {
			gotoonoff();

		}

	});

	onoffbtn.addEventListener("swipe", function(e) {
		console.log(e.detail.direction + "swipe event fired");

		if (e.detail.direction == 'right') {

			gotomain();
		} else if (e.detail.direction == 'left') {
			gotopower();

		} else {
			if (currentconnect != 1) {
				tau.openPopup("#warningpopup");
				if (setting_vibe.checked == true)
					navigator.vibrate(1000);
			}

			else {

			}
		}

	});
	
	);