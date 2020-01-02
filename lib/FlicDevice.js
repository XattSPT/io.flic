'use strict';

const Homey = require('homey');

class FlicDevice extends Homey.Device {

    async onAdded(){
        try{
            console.log("Adding New Flic Device")
            let id = Homey.ManagerSettings.get('webhookid')
            let secret = Homey.ManagerSettings.get('webhooksecret')
            let device = await this.getData()
            let settings
            if (id !== "" && secret !== "" ){
                let url = "https://webhooks.athom.com/webhook/" + id + "/?id=flic&"
                settings = {
                    'clickurl': url + "action=click&flic=" + device.id,
                    'dclickurl' : url + "action=doubleclick&flic=" + device.id,
                    'hclickurl' : url + "action=holdclick&flic=" + device.id
                }
                this.setSettings(settings) 
            } else {
                this.setWarning("Configure Webhook on App Settings")
            }    
            await this.onInit();
            let driver = this.getDriver()
            await driver.onInit();
        } catch (error) {
            console.log(error);
        }
    }

    async onDeleted(){
        try{
            let driver = this.getDriver()
            await driver.onInit();
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
            if ( action == "click"){
                this.onCapabilityClick()
            } else if ( action == "doubleclick"){
                this.onCapabilityDoubleClick()
            } else if ( action == "holdclick"){
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
                let driver = this.getDriver()
                driver.triggerClick(this)
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
                let driver = this.getDriver()
                driver.triggerDoubleClick(this)
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
                let driver = this.getDriver()
                driver.triggerHoldClick(this)
            }
        }catch (err) {
            throw new Error(err);
        }
    } 

    async onSettings(oldsettings, newsettings, changedsettings){
        try{
            //console.log(newsettings)
            if(newsettings.uiselection == "click"){
                this.setCapabilityOptions("click", {"uiQuickAction": true} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            } else if(newsettings.uiselection == "dclick"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": true} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            } else if(newsettings.uiselection == "dclick"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": true} )
            } else if(newsettings.uiselection == "none"){
                this.setCapabilityOptions("click", {"uiQuickAction": false} )
                this.setCapabilityOptions("dclick", {"uiQuickAction": false} )
                this.setCapabilityOptions("hclick", {"uiQuickAction": false} )
            }
            if(newsettings.clickon == true && this.hasCapability("click")== false){
                console.log("afageix click")
                //this.addCapability("click")
            } else if(newsettings.clickon == false && this.hasCapability("click")== true){
                console.log("borra click")
                //this.removeCapability("click")
            }

            if(newsettings.dclickon == true && this.hasCapability("dclick")== false){
                console.log("afageix dclick")
                //this.addCapability("dclick")
            } else if(newsettings.dclickon == false && this.hasCapability("dclick")== true){
                console.log("borra dclick")
                //this.removeCapability("dclick")
            }

            if(newsettings.hclickon == true && this.hasCapability("hclick")== false){
                console.log("afageix hclick")
                //await this.addCapability("hclick")
            } else if(newsettings.hclickon == false && this.hasCapability("hclick")== true){
                console.log("borra hclick")
                //await this.removeCapability("hclick")
            }

        }catch (err) {
            throw new Error(err);   
        }
    }

}

module.exports = FlicDevice;
