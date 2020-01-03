'use strict';

const Homey = require('homey');

var fliclib = require("./node_modules/fliclib/fliclibNodeJs");
var FlicClient = fliclib.FlicClient;
var FlicConnectionChannel = fliclib.FlicConnectionChannel;
var FlicScanner = fliclib.FlicScanner;

var client2 = new FlicClient('192.168.1.2', 5554);

//var fliclib2 = require("./node_modules/fliclib/fliclib");
//var FlicClient2 = fliclib2.FlicClient;
var client = new FlicClient("ws://192.168.1.2:5554");

class Flic extends Homey.App {
    onInit() {
        console.log('Successfully init Flic version: %s', Homey.app.manifest.version);


		

		client2.onReady = function() {
			$("#flicServerState").text("Connected");
			client.getInfo(function(info) {
				info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
					onGotButton(bdAddr);
				});
				if (info.currentlyNoSpaceForNewConnection) {
					$("#maxConnectionsWarning").show();
				}
				$("#bluetoothControllerState").text(info.bluetoothControllerState);
			});
		};

		client.onClose = function() {
			$("#flicServerState").text("Closed");
		};

		client.onNewVerifiedButton = function(bdAddr) {
			onGotButton(bdAddr);
		};

		client.onNoSpaceForNewConnection = function(maxConcurrentlyConnectedButtons) {
			$("#maxConnectionsWarning").show();
		};

		client.onGotSpaceForNewConnection = function(maxConcurrentlyConnectedButtons) {
			$("#maxConnectionsWarning").hide();
		};

		client.onBluetoothControllerStateChange = function(state) {
			$("#bluetoothControllerState").text(state);
		};

		function onGotButton(bdAddr) {
			var node = $("<tr><td class='bdaddr'></td><td class='status'></td><td class='pressed'></td></tr>");
			node.find(".bdaddr").text(bdAddr);
			$("#flics").append(node);
			
			var cc = new FlicConnectionChannel(bdAddr, {
				onButtonUpOrDown: function(clickType, wasQueued, timeDiff) {
					console.log(bdAddr + ": " + clickType);
					node.find(".pressed").text(clickType == "ButtonDown" ? "Pressed" : "");
				},
				onCreateResponse: function(error, connectionStatus) {
					node.find(".status").text(error == "NoError" ? connectionStatus : error);
				},
				onConnectionStatusChanged: function(connectionStatus, disconnectReason) {
					node.find(".status").text(connectionStatus);
				}
			});
			client.addConnectionChannel(cc);
		}

		function startScanWizard() {
			$("#addBtn").hide();
			$("#cancelAddBtn").show();
			
			$("#addBtnResult").text("Welcome to the add new button wizard. Press and hold down your Flic button to add it.");
			
			/*var finished = false;
			function success(cc, bdAddr) {
				client.removeConnectionChannel(cc);
				$("#addBtnResult").text("Button " + bdAddr + " successfully added!");
				done();
			}
			function failed(msg) {
				$("#addBtnResult").text("Scan Wizard Failed: " + msg);
				done();
			}
			function done() {
				finished = true;
				$("#addBtn").show();
				$("#cancelAddBtn").hide();
			}
			var cc = null;
			
			var scanner = new FlicScanner({
				onAdvertisementPacket: function(bdAddr, name, rssi, isPrivate, alreadyVerified) {
					if (alreadyVerified) {
						return;
					}
					if (isPrivate) {
						$("#addBtnResult").text("Your button is private. Hold down for 7 seconds to make it public.");
						return;
					}
					client.removeScanner(scanner);
					
					cc = new FlicConnectionChannel(bdAddr, {
						onCreateResponse: function(error, connectionStatus) {
							if (finished) {
								return;
							}
							if (connectionStatus == "Ready") {
								// Got verified by someone else between scan result and this event
								success(cc, bdAddr);
							} else if (error != "NoError") {
								failed("Too many pending connections");
							} else {
								$("#addBtnResult").text("Found a public button. Now connecting...");
								setTimeout(function() {
									client.removeConnectionChannel(cc);
								}, 30 * 1000);
							}
						},
						onConnectionStatusChanged: function(connectionStatus, disconnectReason) {
							if (!finished && connectionStatus == "Ready") {
								success(cc, bdAddr);
							}
						},
						onRemoved: function(removedReason) {
							if (finished) {
								return;
							}
							if (removedReason == "RemovedByThisClient") {
								failed("Timed out");
							} else {
								failed(removedReason);
							}
						}
					});
					client.addConnectionChannel(cc);
				}
			});
			client.addScanner(scanner);
			window.stopScanWizard = function() {
				client.removeScanner(scanner);
				if (cc) {
					client.removeConnectionChannel(cc);
				}
				$("#addBtnResult").text("");
				done();
			};*/
			
			var scanWizard = new FlicScanWizard({
				onFoundPrivateButton: function() {
					$("#addBtnResult").text("Your button is private. Hold down for 7 seconds to make it public.");
				},
				onFoundPublicButton: function(bdAddr, name) {
					$("#addBtnResult").text("Found public button " + bdAddr + " (" + name + "). Now connecting...");
				},
				onButtonConnected: function(bdAddr, name) {
					$("#addBtnResult").text("Connected, now verifying and pairing...");
				},
				onCompleted: function(result, bdAddr, name) {
					if (result == "WizardSuccess") {
						$("#addBtnResult").text("Button " + bdAddr + " successfully added!");
					} else if (result != "WizardCancelledByUser") {
						$("#addBtnResult").text("Scan wizard failed: " + result);
					}
					$("#addBtn").show();
					$("#cancelAddBtn").hide();
				}
			});
			client.addScanWizard(scanWizard);
			window.stopScanWizard = function() {
				client.cancelScanWizard(scanWizard);
				$("#addBtnResult").text("");
			};
		}


/*

function listenToButton(bdAddr) {
	var cc = new FlicConnectionChannel(bdAddr);
	client.addConnectionChannel(cc);
	cc.on("buttonUpOrDown", function(clickType, wasQueued, timeDiff) {
		console.log(bdAddr + " " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
	});
	cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
		console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
	});
}

client.once("ready", function() {
	console.log("Connected to daemon!");
	let inf = client.getInfo(function(info){console.log("HOLA")})
	console.log(inf)
	client.getInfo(function(info) {
		console.log(info)
		info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
			listenToButton(bdAddr);
		});
	});
});

client.on("bluetoothControllerStateChange", function(state) {
	console.log("Bluetooth controller state change: " + state);
});

client.on("newVerifiedButton", function(bdAddr) {
	console.log("A new button was added: " + bdAddr);
	listenToButton(bdAddr);
});

client.on("error", function(error) {
	console.log("Daemon connection error: " + error);
});

client.on("close", function(hadError) {
	console.log("Connection to daemon is now closed");
});

*/




};

}


module.exports = Flic;
