/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const recipes = require('./recipes');
var request = require('request');
var https = require('https');
const APP_ID = 'amzn1.ask.skill.15e55d44-515c-42e2-81bc-2ebe091af7d6'; // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Vector',
            WELCOME_MESSAGE: "Welcome to Vector Skill. You can ask a question like, which bus to take for Raj Ghat? ... Now, what can I help you with?",
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: 'You have to take the following transits.',
            HELP_MESSAGE: "You can ask questions such as, which bus to take for Raj Ghat?, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMT: "You can say things like, which bus to take for Raj Ghat?, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            RECIPE_REPEAT_MESSAGE: 'I Repeat, ',
            RECIPE_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know. ",
            RECIPE_NOT_FOUND_WITH_ITEM_NAME: 'Bus Depot or Route Not found. ',
            RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME: 'that route. ',
            RECIPE_NOT_FOUND_REPROMPT: 'What else can I help with?',
        },
    },
    'en-US': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'American Minecraft Helper',
        },
    },
    'en-GB': {
        translation: {
            RECIPES: recipes.RECIPE_EN_GB,
            SKILL_NAME: 'British Minecraft Helper',
        },
    },
    'de': {
        translation: {
            RECIPES: recipes.RECIPE_DE_DE,
            SKILL_NAME: 'Assistent für Minecraft in Deutsch',
            WELCOME_MESSAGE: 'Willkommen bei %s. Du kannst beispielsweise die Frage stellen: Welche Rezepte gibt es für eine Truhe? ... Nun, womit kann ich dir helfen?',
            WELCOME_REPROMT: 'Wenn du wissen möchtest, was du sagen kannst, sag einfach „Hilf mir“.',
            DISPLAY_CARD_TITLE: '%s - Rezept für %s.',
            HELP_MESSAGE: 'Du kannst beispielsweise Fragen stellen wie „Wie geht das Rezept für“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
            HELP_REPROMT: 'Du kannst beispielsweise Sachen sagen wie „Wie geht das Rezept für“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
            STOP_MESSAGE: 'Auf Wiedersehen!',
            RECIPE_REPEAT_MESSAGE: 'Sage einfach „Wiederholen“.',
            RECIPE_NOT_FOUND_MESSAGE: 'Tut mir leid, ich kenne derzeit ',
            RECIPE_NOT_FOUND_WITH_ITEM_NAME: 'das Rezept für %s nicht. ',
            RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME: 'dieses Rezept nicht. ',
            RECIPE_NOT_FOUND_REPROMPT: 'Womit kann ich dir sonst helfen?',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'BusIntent': function () {
	    const org = "badarpur";
        
        const itemSlot = this.event.request.intent.slots.Item;
        var itemName = "";
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }
        console.log(itemName);
        const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), itemName);
        const myRecipes = this.t('RECIPES');
        //GET REQ
        //GET Req
        var endpoint = "https://maps.googleapis.com/maps/api/directions/json?origin=" + org + "&destination=" + itemName + "&mode=transit&transit_mode=bus&region=in&transit_routing_preference=fewer_transfers&key=AIzaSyDJVbD5YOrosAUcX8zEl4zo_pv-7gxQg-A"
        var body = ""
        
        https.get(endpoint, (response) => {
            response.on('data', (chunk) => { body += chunk })
            response.on('end', () => {
            var data = JSON.parse(body)
            // console.log(data);
            try{
                var distance = data.routes[0].legs[0].distance.text
                console.log(distance)
                var duration = data.routes[0].legs[0].duration.text
                console.log(duration)
                var steps = data.routes[0].legs[0].steps;
                console.log(steps)
                var answer = "Take Bus Number "
                var flag  = false
                for(var i=0;i<steps.length;i++){
                    //
                    if(steps[i].travel_mode=="TRANSIT"){
                        if(flag==true){
                            answer = answer + " then take";
                        }
                        var busNum = steps[i].transit_details.line.short_name
                        console.log(busNum)
                        var busName = steps[i].transit_details.line.name
                        console.log(busName)
                        answer = answer + " " + busNum + " with name " + busName + ". It will take you " + duration + " to reach your destination, which is " + distance + " away."
                        flag = true;
                    }
                }
            }catch(err){
                //
                console.log(err)
            }
 
 
            // context.succeed(
            //     generateResponse(
            //     buildSpeechletResponse(`Current subscriber count is ${subscriberCount}`, true),
            //     {}
            //     )
            // )
 
            if (answer) {
                this.attributes.speechOutput = answer;
                this.attributes.repromptSpeech = this.t('RECIPE_REPEAT_MESSAGE');
                this.emit(':askWithCard', answer, this.attributes.repromptSpeech, cardTitle, answer);
            } else {
                let speechOutput = this.t('RECIPE_NOT_FOUND_MESSAGE');
                const repromptSpeech = this.t('RECIPE_NOT_FOUND_REPROMPT');
                if (itemName) {
                    speechOutput += this.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', itemName);
                } else {
                    speechOutput += this.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME');
                }
                speechOutput += repromptSpeech;
 
                this.attributes.speechOutput = speechOutput;
                this.attributes.repromptSpeech = repromptSpeech;
 
                this.emit(':ask', speechOutput, repromptSpeech);
            }
 
            })
        })

        // request
        //     .get(endpoint)
        //     .on('response', function(response) {
        //         console.log(response.statusCode) // 200 
        //         body +=response
        //         var data = JSON.parse(response)
        //         try{
        //             var distance = data.routes[0].legs[0].distance.text
        //             var duration = data.routes[0].legs[0].duration.text
        //             var steps = data.routes[0].legs[0].steps[0];
        //             var answer = "Take"

        //             for(i=0;i<steps.length;i++){
        //                 //
        //                 if(steps[i].travel_mode==="TRANSIT"){
        //                     var busNum = steps[i].transit_details.line.short_name
        //                     var busName = steps[i].transit_details.line.name
        //                     answer = answer + " " + busNum + " with name " + busName 
        //                 }
        //             }

        //         }catch(err){
        //             //
        //             console.log(err)
        //         }

        //         if (answer) {
        //             this.attributes.speechOutput = answer;
        //             this.attributes.repromptSpeech = this.t('RECIPE_REPEAT_MESSAGE');
        //             this.emit(':askWithCard', answer, this.attributes.repromptSpeech, cardTitle, answer);
        //         } else {
        //             let speechOutput = this.t('RECIPE_NOT_FOUND_MESSAGE');
        //             const repromptSpeech = this.t('RECIPE_NOT_FOUND_REPROMPT');
        //             if (itemName) {
        //                 speechOutput += this.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', itemName);
        //             } else {
        //                 speechOutput += this.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME');
        //             }
        //             speechOutput += repromptSpeech;
    
        //             this.attributes.speechOutput = speechOutput;
        //             this.attributes.repromptSpeech = repromptSpeech;
    
        //             this.emit(':ask', speechOutput, repromptSpeech);
        //         }
        //     })
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
