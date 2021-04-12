'use strict';

const Homey = require('homey');

class FlicDevice extends Homey.Device {

    async onAdded(){
        try{
            console.log("Adding New Flic Device")
            let id = await Homey.env.WEBHOOK_ID
            let webhook_id = await this.homey.settings.get('webhook_id') 
            let device = await this.getData()
            console.log(id)
            let settings
            if (id !== ""){
                let url = "https://webhooks.athom.com/webhook/" + id + "/?id=" + webhook_id + "&"
                settings = {
                    'clickurl': url + "action=click&flic=" + device.id,
                    'dclickurl' : url + "action=dclick&flic=" + device.id,
                    'hclickurl' : url + "action=hclick&flic=" + device.id
                }
                this.setSettings(settings) 
            } else {
                this.setWarning("Configure Webhook on App Settings")
            }    
            this.onInit();
            //await driver.onInit();
            //let driver = driver.getDriver()
        } catch (error) {
            console.log(error);
        }
    }

    async onDeleted(){
        try{

        } catch (error) {
            console.log(error);
        }
    }

    onInit() {
        this.registerCapabilityListener('click', this.onCapabilityClick.bind(this));
        this.registerCapabilityListener('dclick', this.onCapabilityDoubleClick.bind(this));
        this.registerCapabilityListener('hclick', this.onCapabilityHoldClick.bind(this));

    }

    activation(data){
        try{
            let action = data.query.action
            //console.log(" action: ", action)
            if ( action == "click"){
                this.onCapabilityClick()
            } else if ( action == "dclick"){
                this.onCapabilityDoubleClick()
            } else if ( action == "hclick"){
                this.onCapabilityHoldClick()
            }
        }catch (err) {
            throw new Error(err);
        }
    }

    async onCapabilityClick (value, opts){
        try{
            let settings = this.getSettings()
            if(settings.clickon == true){
                console.log("Click on",this.getData().name)
                this.driver.triggerClick(this)
            }
        }catch (err) {
            throw new Error(err);
        }
    } 
    async onCapabilityDoubleClick (value, opts){
        try{
            let settings = this.getSettings()
            if(settings.dclickon == true){
                console.log("DoubleClick on",this.getData().name)
                this.driver.triggerDoubleClick(this)
            }
        }catch (err) {
            throw new Error(err);
        }
    } 
    async onCapabilityHoldClick (value, opts){
        try{
            let settings = this.getSettings()
            if(settings.hclickon == true){
                console.log("HoldClick on",this.getData().name)
                this.driver.triggerHoldClick(this)
            }
        }catch (err) {
            throw new Error(err);
        }
    } 

    async onSettings({oldSettings, newSettings, changedKeys}){
        try{
            //console.log(newSettings)
            if(newSettings.uiselection == "click"){
                this.setCapabilityOptions("click", {"uiQuickAction": true} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            } else if(newSettings.uiselection == "dclick"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": true} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            } else if(newSettings.uiselection == "dclick"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": true} )
            } else if(newSettings.uiselection == "none"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            }
            if(newSettings.clickon == true && this.hasCapability("click")== false){
                console.log("afageix click")
                this.addCapability("click")
            } else if(newSettings.clickon == false && this.hasCapability("click")== true){
                console.log("borra click")
                this.removeCapability("click")
            }

            if(newSettings.dclickon == true && this.hasCapability("dclick")== false){
                console.log("afageix dclick")
                this.addCapability("dclick")
            } else if(newSettings.dclickon == false && this.hasCapability("dclick")== true){
                console.log("borra dclick")
                this.removeCapability("dclick")
            }

            if(newSettings.hclickon == true && this.hasCapability("hclick")== false){
                console.log("afageix hclick")
                await this.addCapability("hclick")
            } else if(newSettings.hclickon == false && this.hasCapability("hclick")== true){
                console.log("borra hclick")
                await this.removeCapability("hclick")
            }

        }catch (err) {
            throw new Error(err);   
        }
    }

}

module.exports = FlicDevice;
