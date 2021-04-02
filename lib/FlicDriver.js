"use strict";

const Homey = require('homey');
const DRIVER_LOCATION = "/app/flic.io/drivers/flic/";



class FlicDriver extends Homey.Driver {
    async onInit() {
        try{
            let id = await Homey.env.WEBHOOK_ID;
            let secret = await Homey.env.WEBHOOK_SECRET;
            let webhook_id = await this.homey.settings.get('webhook_id');
            if (webhook_id) {
                console.log ('Still remember webhook_id: ' + webhook_id);
            } else {
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                webhook_id = '';
                for( var i=0; i < 10; i++ )
                    webhook_id += possible.charAt(Math.floor(Math.random() * possible.length)
                );
                console.log('New webhook_id: ' + webhook_id);
                webhook_id = this.homey.settings.set('webhook_id', webhook_id);
                console.log(webhook_id)
            }

            if (id !== "" ){
                let driver = this
                let devices = await driver.getDevices()
                let qty = devices.length
                let a
                let device
                let devicee
                let battery
                let flicname
                let myWebhook = await this.homey.cloud.createWebhook( id, secret, {"id": webhook_id} );
                myWebhook
                    .on('message', args => {                 
                        for (a = 0; a < qty; a++) {
                            device = devices[a].getData()
                            devicee = devices[a]
                            battery = args.headers["button-battery-level"]
                            flicname = args.headers["button-name"]
                            if (device.id == args.query.flic){
                                devices[a].activation(args)
                                devices[a].setCapabilityValue('measure_battery', Number(args.headers["button-battery-level"]) )
                                devices[a].setSettings({"flicname": flicname})   
                            }
                        }
                    })
            } else {
                console.log("PENDING WEBHOOK DATA")
                let options = {"excerpt": "Flic APP needs configuration"}
                let noti = this.homey.Notification(options)

                this.homey.ManagerNotifications.registerNotification(noti)

                let devices = this.getDevices()
                let device
                let a 
                for (a = 0; a < devices.length; a++) {
                    devices[a].setWarning("Configure Webhook on App Settings")
                }
            }

            this._ClickTrigger = this.homey.flow.getDeviceTriggerCard('tclick');
            this._DClickTrigger = this.homey.flow.getDeviceTriggerCard('tdclick');
            this._HClickTrigger = this.homey.flow.getDeviceTriggerCard('thclick');


        } catch (error) {
            console.log(error);
        }
    }
    
    triggerClick(device) {
        this._ClickTrigger
        .trigger(device)
        .catch(this.error);
    } 

    triggerDoubleClick(device) {
        this._DClickTrigger
        .trigger(device)
        .catch(this.error);
    } 

    triggerHoldClick(device) {
        this._HClickTrigger
        .trigger(device)
        .catch(this.error);
    } 

    async getdevices(data, callback){
        try{
            let existingdevices = await this.getDevices()
            let devices = []
            if (existingdevices.length == 0) {
                devices.push({
                    "name": "Flic1",
                    "data": {
                        "id": 1,
                        "name": "Flic1",
                    }
                })
            } else {
                let last = existingdevices[existingdevices.length-1].getData().id
                let num = Number(last)+1
                devices.push({
                    "name": "Flic" + num,
                    "data": {
                        "id": num,
                        "name": "Flic" + num,
                    }
                })
            }
            return callback(devices)
        } catch (error) {
            console.log(error);
        }
    }  
    onPair (socket) {   
        let driver = this 
        let pairingDevice = {
            name: this.homey.__('pair.default.name.device'),
            data: {
              },
        };  
        socket.on('list_devices', (data, callback) => {
            this.getdevices("devices", function(devices){
                callback(null, devices)} 
        )})
        
        socket.on('add_device', (device, callback) => {
          console.log('pairing', device)
        })
    }

}

module.exports = FlicDriver;