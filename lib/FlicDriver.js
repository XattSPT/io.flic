"use strict";

const Homey = require('homey');

Homey.ManagerSettings.on('set', function(hola){
    let id = Homey.ManagerSettings.get('webhookid')
    let secret = Homey.ManagerSettings.get('webhooksecret') 
    let driver = Homey.ManagerDrivers.getDriver('flic')
    let devices = driver.getDevices()
    let device
    let a 
    let settings
    let url = "https://webhooks.athom.com/webhook/" + id + "/?id=flic&"
    for (a = 0; a < devices.length; a++) {
        device = devices[a].getData()
        settings = {
            'clickurl': url + "action=click&flic=" + device.id,
            'dclickurl' : url + "action=doubleclick&flic=" + device.id,
            'hclickurl' : url + "action=holdclick&flic=" + device.id
        }
        devices[a].setSettings(settings) 
        devices[a].unsetWarning()
    }
    driver.onInit()
})


class FlicDriver extends Homey.Driver {

    async onInit() {
        try{
            let id = Homey.ManagerSettings.get('webhookid')
            let secret = Homey.ManagerSettings.get('webhooksecret') 
            //console.log("id: ", id, " secret: ", secret)
            if (id !== "" && secret !== "" ){
                let data = {
                    id: 'flic'
                }
                let driver = this
                let devices = await driver.getDevices()
                let qty = devices.length
                let a
                let device
                let devicee
                let battery
                let flicname
                let myWebhook = new Homey.CloudWebhook( id, secret, data );
                myWebhook
                    .on('message', args => {                 
                        for (a = 0; a < qty; a++) {
                            device = devices[a].getData()
                            devicee = devices[a]
                            battery = args.headers["button-battery-level"]
                            flicname = args.headers["button-name"]
                            if (device.id == args.query.flic){
                                console.log(args)
                                devices[a].activation(args)
                                devices[a].setCapabilityValue('measure_battery', Number(args.headers["button-battery-level"]) )
                                devices[a].setSettings({"flicname": flicname})   
                            }
                        }
                    })
                    .register()
                    .then(() => {
                        console.log('Webhook registered!');
                    })
                    .catch( this.error )
            } else {
                console.log("PENDING WEBHOOK DATA")
                let options = {"excerpt": "Flic APP needs configuration"}
                let noti = new Homey.Notification(options)
                Homey.ManagerNotifications.registerNotification(noti)

                let devices = this.getDevices()
                let device
                let a 
                for (a = 0; a < devices.length; a++) {
                    devices[a].setWarning("Configure Webhook on App Settings")
                }
            }

            this._ClickTrigger = new Homey.FlowCardTriggerDevice('tclick').register();
            this._ClickTrigger.registerRunListener((args, state) => {
                conditionMet = true
                return Promise.resolve(conditionMet);  
            });

            this._DClickTrigger = new Homey.FlowCardTriggerDevice('tdclick').register();
            this._DClickTrigger.registerRunListener((args, state) => {
                conditionMet = true
                return Promise.resolve(conditionMet);  
            });

            this._HClickTrigger = new Homey.FlowCardTriggerDevice('thclick').register();
            this._HClickTrigger.registerRunListener((args, state) => {
                conditionMet = true
                return Promise.resolve(conditionMet);  
            });


        } catch (error) {
            console.log(error);
        }
    }
    
    hola() {
    }

    triggerClick(device) {
        this._ClickTrigger.trigger(device);
        return this;
    } 

    triggerDoubleClick(device) {
        this._DClickTrigger.trigger(device);
        return this;
    } 

    triggerHoldClick(device) {
        this._HClickTrigger.trigger(device);
        return this;
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