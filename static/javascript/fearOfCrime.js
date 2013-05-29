//Custom functionality for the Fear of Crime in Christchurch Web Application
//builds on the OpenLayers Library
//made by: Hua and Carsten 18.11.2011
//updated by: Carsten 10.12.2011 - 31.01.2012


//functionality for sending a message after a data commit has been tried
//includes a redirect to a different web page depending on the outcome of the commit
//!!THIS IS NOT USED AT THE MOMENT!!-CHECK IT UP
function showMsg(szMessage) {
    document.getElementById("message").innerHTML = szMessage;
    setTimeout("document.getElementById('message').innerHTML = ''", 2000);
};


//Used to close the welcome layer and the cloud layer (which works as a kind of splash screen)
function closeLayers(myLayer1,myLayer2) {
    document.getElementById(myLayer1).style.display = 'none';
    document.getElementById(myLayer2).style.display = 'none';
}


//Is not used yet but can be used for opening up the questionaire layer
//!!THIS IS NOT USED AT THE MOMENT!!-CHECK IT UP
function openLayers(myLayer1, myLayer2) {
    document.getElementById(myLayer1).style.display = 'block';
    document.getElementById(myLayer2).style.display = 'block';
}

//Got this pause function from http://www.sean.co.uk/a/webdesign/javascriptdelay.shtm
function pausecomp(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) { }
} 

// add pixmap styles for our WFS layer - to get something else than a boring orange circle dot thing
var nightStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
        pointRadius: 11,
        externalGraphic: "images/crying-icon.png"
    }),
    "select": new OpenLayers.Style({
        pointRadius: 11,
        externalGraphic: "images/damn-icon.png"
    })
});

var generalStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
        pointRadius: 10,
        externalGraphic: "images/sad-icon.png"
    }),
    "select": new OpenLayers.Style({
        pointRadius: 10,
        externalGraphic: "images/crying-icon_day.png"
    })
});

var wfsStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
        pointRadius: 7,
        externalGraphic: "images/crying-icon.png"
    }),
    "select": new OpenLayers.Style({
        pointRadius: 7,
        externalGraphic: "images/damn-icon.png"
    })
});


//add a rule to wfsStyle to use yellow point icon if it is a daytime point or (elseFilter: true) keep the blue point icon if it is a nighttime point
wfsStyle.styles['default'].addRules([
            new OpenLayers.Rule({
                filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO, property: "pointtype", value: 'general'}),
                symbolizer: { pointRadius: 6, externalGraphic: "images/sad-icon.png"}}),
            new OpenLayers.Rule({
                elseFilter: true})
        ]);



var areaStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
        'fillColor': '#669933',
        'fillOpacity': 0,
        'strokeColor': '#aaee77',
        'strokeWidth': 1,
        'strokeOpacity': 0.4,
        'pointRadius': 8 //do we need point radius for anything???
    }),
    "select": new OpenLayers.Style({
        'fillColor': '#669933',
        'fillOpacity': .6,
        'strokeColor': '#aaee77',
        'strokeWidth': 3,
        'strokeOpacity': 0.8,
        'pointRadius': 8    //do we need point radius for anything???
    })
});


//pause function from http://www.sean.co.uk/a/webdesign/javascriptdelay.shtm
function pausecomp(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) { }
} 


//a class to use when deleting points towards the end of the init()
//this is more complex than it needs to be because it also works for cases where
//a feature that has already been stored in the database and then gets deleted, while
//the features we add has not been stored in the database yet
//but we are keeping the advanced method to have it available if needed
var DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
    initialize: function(layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Feature(
            this, layer, { click: this.clickFeature }
            );
    },
    clickFeature: function(feature) {
        // if feature doesn't have a fid, destroy it
        if (feature.fid == undefined) {
            this.layer.destroyFeatures([feature]);
        }
        else {
            feature.state = OpenLayers.State.DELETE;
            this.layer.events.triggerEvent("afterfeaturemodified", { feature: feature });
            feature.renderIntent = "select";
            this.layer.drawFeature(feature);
        } 
    },
    setMap: function(map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.DeleteFeature"
});

//global variable to keep the answers from the questionnaire
var arry = new Array(11);

//global variable to keep the suburb answer from step 3
var suburb = ''; //maybe default should be none or null - and what would it be if person outside of Christchurch

//global variable to keep on top of which step in the application we're at
var step = 1; //default to 1

//global variable to hold feedback information
var feedback = '';

//global variable to hold the questionaire id generated when the data is committed to the questionaire table
var qid = '';

var tid = 0;
//var ready = -1;

//function for testing form input
//maybe work on some more feedback on where things are missing 
//and what to do about it
function test() {
    var time = new Date().getTime();
    tid = parseInt(time);
    var gender = document.getElementById("gender").value;
    var age = document.getElementById("age").value;
    var occup = document.getElementById("occup").value;
    var income = document.getElementById("income").value;
    var education = document.getElementById("edu").value;
    var ethn = document.getElementById("ethn").value;
    var offended = document.getElementById("offended").value;
    var worry = document.getElementById("worry").value;
    var comment = document.getElementById("comment").value;
    arry = [time, gender, age, occup, income, education, ethn, offended, worry, suburb, comment];
    var textArray = ["txtGender", "txtAge", "txtOccup", "txtIncome", "txtEdu", "txtEthn", "txtOffended", "txtWorry", "txtComment"];
    var i = 0;
    var flag = 0;
    for (i = 1; i < 10; i++) {
        if (arry[i] == 'null') {
            document.getElementById(textArray[i - 1]).style.color = "Red";
            flag = 1;
            }
        else {
            document.getElementById(textArray[i - 1]).style.color = "Green";
            }
        }
    if (flag == 1) {
        alert("The quetions with red text still need an answer!!");
        return false;
        }
    else {
        /* alert(arry); */
        return true;
        }
    }


//**********************************************************************************
//initialise all the functionality in the webpage

function init() {
    OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
    //set up a save strategy
    var saveStrategy = new OpenLayers.Strategy.Save();
    saveStrategy.events.register('success', null, showSuccessMsg);
    saveStrategy.events.register('fail', null, showFailureMsg);

    //set up projections
    // World Geodetic System 1984 projection
    var WGS84 = new OpenLayers.Projection("EPSG:4326");
    // WGS84 Google Mercator projection
    var WGS84_google_mercator = new OpenLayers.Projection("EPSG:900913");

    //*******************************************************************************
    //Initialize the map
    //creates a new openlayers map in the <div> html element with id="mapElement"
    var map = new OpenLayers.Map('mapElement', {
        //
        controls: [
        //allows the user pan ability
            new OpenLayers.Control.Navigation(),
        //displays the pan/zoom tools                   
            new OpenLayers.Control.PanZoom()],
        //displays a layer switcher
        //    new OpenLayers.Control.LayerSwitcher(),
        //displays the mouse position's coordinates in a
        //<div> html element with id="coordinates"
        //    new OpenLayers.Control.MousePosition(
        //        { div: document.getElementById("coordinates") })
        //    ],
        //projection: WGS84_google_mercator,
        displayProjection: WGS84
    });

    // map extent - CHECK UP on the transformation part of things, does seem to look right on the website
    var mapextent =
        new OpenLayers.Bounds(174.691887,-41.360319, 174.862518,-41.212496).transform(WGS84, WGS84_google_mercator);
    //chch_area_extent used to test if a datapoint is within the chch area, which is the area of interest
    var chch_area_extent =
        new OpenLayers.Bounds(174.691887,-41.360319, 174.862518,-41.212496).transform(WGS84, WGS84_google_mercator);

    //base layers
    var openstreetmap = new OpenLayers.Layer.OSM();
    
    //**************************************************************************************************************
    
    //wfs-t layer - editable layer
    var wfs_layer = new OpenLayers.Layer.Vector("All Crime Fear Points", {
        styleMap: wfsStyle,
        visibility: false,
        strategies: [new OpenLayers.Strategy.BBOX(), saveStrategy],
        //projection: new OpenLayers.Projection("EPSG:4326"),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            // loading data through url path
            url: "http://geo.runningwild.co.nz:8080/geoserver/wfs",
            featureNS: "http://www.openplans.org/topp",
            // layer name
            featureType: "fearofcrime_points",
            maxExtent: chch_area_extent,
            // geometry column name
            geometryName: "the_geom",
            schema: "http://localhost:8080/geoserver/wfs/DescribeFeatureType?version=1.1.0&;typeName=topp:fearofcrime_points",
            srsName: "EPSG:4326"
        })
    });

    //wfs-t layer NIGHT - overlay to add new points to
    var wfs_overlay = new OpenLayers.Layer.Vector("Crime Points Overlay (added this session)", {
        styleMap: generalStyle,
        //visibility: false,
        //strategies: [new OpenLayers.Strategy.BBOX(), saveStrategy],
        //projection: new OpenLayers.Projection("EPSG:4326"),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            // loading data through url path
            url: "http://geo.runningwild.co.nz:8080/geoserver/wfs",
            featureNS: "http://www.openplans.org/topp",
            // layer name
            featureType: "foc_overlay",
            maxExtent: mapextent,
            // geometry column name
            geometryName: "the_geom",
            schema: "http://localhost:8080/geoserver/wfs/DescribeFeatureType?version=1.1.0&;typename=topp:foc_overlay",
            srsName: "EPSG:4326"
        })
    });

    //wfs-t layer DAY - overlay to add new points to
    var wfs_overlay2 = new OpenLayers.Layer.Vector("Crime Points Overlay (added this session)", {
        styleMap: nightStyle,
        //visibility: false,
        //strategies: [new OpenLayers.Strategy.BBOX(), saveStrategy],
        //projection: new OpenLayers.Projection("EPSG:4326"),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            // loading data through url path
            url: "http://geo.runningwild.co.nz:8080/geoserver/wfs",
            featureNS: "http://www.openplans.org/topp",
            // layer name
            featureType: "foc_overlay2",
            maxExtent: mapextent,
            // geometry column name
            geometryName: "the_geom",
            schema: "http://localhost:8080/geoserver/wfs/DescribeFeatureType?version=1.1.0&;typename=topp:foc_overlay2",
            srsName: "EPSG:4326"
        })
    });



    //areaUnit wfs layer is used to record the location of the user as an area rather than a point
    var areaUnit_layer = new OpenLayers.Layer.Vector("Census Area Units in Christchurch", {
        styleMap: areaStyle,
        //visibility: false,
        strategies: [new OpenLayers.Strategy.BBOX()],
        projection: new OpenLayers.Projection("EPSG:4326"),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.1.0",
            // loading data through url path
            url: "http://geo.runningwild.co.nz:8080/geoserver/wfs",
            featureNS: "http://www.opengeospatial.net/cite",
            // layer name
            featureType: "chch_au_wgs84",
            maxExtent: mapextent,
            // geometry column name
            geometryName: "the_geom",
            schema: "http://localhost:8080/geoserver/wfs/DescribeFeatureType?version=1.1.0&;typeName=cite:chch_au_wgs84",
            srsName: "EPSG:4326"
        })
    });






    //************************************************************************************************************
    //adding the layers to the map and zooming to the extent

    map.addLayers([openstreetmap, areaUnit_layer, wfs_layer, wfs_overlay, wfs_overlay2]);
    map.zoomToExtent(mapextent);
    
    //**********************************************************************************
    //functions to overview the number of features that need to be committed
    //have been used for testing
    function displayStatusLayer() {
        var createCnt = 0;
        var updateCnt = 0;
        var deleteCnt = 0;
        var i, len, state;
        for (i = 0, len = wfs_layer.features.length; i < len; i++) {
            state = wfs_layer.features[i].state;
            if (state == OpenLayers.State.INSERT) {
                createCnt++;
            } else if (state == OpenLayers.State.UPDATE) {
                updateCnt++;
            } else if (state == OpenLayers.State.DELETE) {
                deleteCnt++;
            }
        }
        alert("wfs_layer has " + createCnt + " features to create, " +
                                         updateCnt + " features to update, " +
                                         deleteCnt + " features to delete");
        }
    
    
    function displayStatusOverlay() {
        var createCnt = 0;  
        var updateCnt = 0;
        var deleteCnt = 0;
        var i, len, state;
        for (i = 0, len = wfs_overlay.features.length; i < len; i++) {
            state = wfs_overlay.features[i].state;
            if (state == OpenLayers.State.INSERT) {
                createCnt++;
            } else if (state == OpenLayers.State.UPDATE) {
                updateCnt++;
            } else if (state == OpenLayers.State.DELETE) {
                deleteCnt++;
            }
        }
        alert("wfs_overlay has " + createCnt + " features to create, " +
                                         updateCnt + " features to update, " +
                                         deleteCnt + " features to delete");
        createCnt = 0;
        updateCnt = 0;
        deleteCnt = 0;                                         
        for (i = 0, len = wfs_overlay2.features.length; i < len; i++) {
            state = wfs_overlay2.features[i].state;
            if (state == OpenLayers.State.INSERT) {
                createCnt++;
            } else if (state == OpenLayers.State.UPDATE) {
                updateCnt++;
            } else if (state == OpenLayers.State.DELETE) {
                deleteCnt++;
            }
        }
        alert("wfs_overlay2 has " + createCnt + " features to create, " +
                                         updateCnt + " features to update, " +
                                         deleteCnt + " features to delete");
                                         

    }
    
    //function testing for the number of added points - this is in the wfs_overlay
    function testingPoints() {
        var count = 0;
        var i, len, state;
        for (i = 0, len = wfs_overlay.features.length; i < len; i++) {
            state = wfs_overlay.features[i].state;
            if (state == OpenLayers.State.INSERT) {
                count++;
            }
            }
        if (count == 0) {
            alert("You haven't clicked on any locations where you believe crime in Christchurch is high - please click on at least one location, where you think there is more crime than normal");
            }
        //skipped the check of only up to 3 points of fear added - instead it is now an unlimited number of points
        //else if (count > 3) {
        //    alert("Please restrict yourself to the 3 Fear Of Crime Points that in your opinion are the worst");
        //    return false;
        //    }
        return count;
    }
    
    //function testing for the number of added points - this is in the wfs_overlay
    function testingPoints2() {
        var count = 0;
        var i, len, state;
        for (i = 0, len = wfs_overlay2.features.length; i < len; i++) {
            state = wfs_overlay2.features[i].state;
            if (state == OpenLayers.State.INSERT) {
                count++;
            }
            }
        if (count == 0) {
            alert("You haven't clicked on any locations where you feel unsafe walking at night in Christchurch area - please click on at least one location, where you feel unsafe walking at night");
            }
        return count;              
    }

    //function testing if area of residence has been selected - this is in the areaUnit_layer
    function testingAreaAdded() {
        if (suburb == '') {
            alert("You haven't selected an area of residence - please select an area");
            return false;
        }
        else {
            return true;
        }
    }

    //function used by the postQuestionnaire function to generate post string
    function generatePostString() {
        varArray = ["g=", "&a=", "&oc=", "&i=", "&ed=", "&et=", "&of=", "&w=", "&s=", "&c="];
        postString = "";
        for (i = 0, len = varArray.length; i < len; i++) {
            if (arry[i+1] == '') {
                arry[i+1] = 'No Comment'
            }
            postString = postString + varArray[i] + arry[i + 1];
        }
        return postString;
    }

    //function that sends the questionnaire data to cgi script on server which commits the data and returns the qid
    //which is the xmlHttpReq.responseText generated by the cgi script 
    function postQuestionnaire() { 
        var xmlHttpReq = false;
        var self = this;
        var strURL = "/cgi-bin/commitValues.py";
        var ready = 0;
        // Mozilla/Safari
        if (window.XMLHttpRequest) {
            self.xmlHttpReq = new XMLHttpRequest();
        }
        // IE
        else if (window.ActiveXObject) {
            self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
        }
        self.xmlHttpReq.open('POST', strURL, true);
        self.xmlHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        counter = 1;
        self.xmlHttpReq.onreadystatechange = function() {
            ready = self.xmlHttpReq.readyState;
            if (ready == 4) {
                if (counter == 1) {
                    qid = self.xmlHttpReq.responseText;
                    document.getElementById("userFeedback").innerHTML = "<br/><center>Questionnaire is in the database</center><br/><center>Now we are working on the points.</center>";
                    finishOff();
                }
                counter++;
            }
        }
        self.xmlHttpReq.send(generatePostString());
        //while waiting for the response
    }



    //insert features from wfs_overlay(that catches the night time points) into the wfs_layer for the database update
    //and now also from the wfs_overlay2(that catches the daylight points) - new attribute added to differentiate between 
    //night and day features
    function insertFromOverlay() {
        var i, len, feature;
        qid_int = parseInt(qid);
        //working with the features in wfs_layer, which contains the night features (attribute night: true)
        for (i = 0, len = wfs_overlay.features.length; i < len; i++) {
            feature = wfs_overlay.features[i];
            if (feature.state == OpenLayers.State.INSERT) {
                //adding the attribute values to the feature      
                feature.attributes = { qid: qid_int, pointtype: 'general' };                
                //the push function adds a feature to the features array and returns the size of the features array
                var featuresPushed = wfs_layer.features.push(feature);                
            }
        }
        //working with the features in wfs_layer2, which contains the day features (attribute night: false)
        for (i = 0, len = wfs_overlay2.features.length; i < len; i++) {
            feature = wfs_overlay2.features[i];
            if (feature.state == OpenLayers.State.INSERT) {
                //adding the attribute values to the feature
                feature.attributes = { qid: qid_int, pointtype: 'night' };
                //the push function adds a feature to the features array and returns the size of the features array
                featuresPushed = wfs_layer.features.push(feature);                
            }
        }
    }
    
    
    //make a list of the featurs that need to be commited  - has been used for testing
    function featuresWithState(state) {
        var list = [];
        var i, len, feature;
        for (i = 0, len = wfs_layer.features.length; i < len; i++) {
            feature = wfs_layer.features[i];
            if (feature.state == state) {
                list.push(feature);
            }
        }
        return list;
    }

    //fear of crime points toolbox panel activation 
    function panelActivation(p, c) {
        p.addControls(c);
        map.addControl(p);
    }


    //these are the functions which tests and controls each step of the web application
    //the appropriate function is activated by clicking the proceed button
    function step1to2() {
        count = testingPoints();
        if (count!=0) {
            document.getElementById('step1').style.background = "Green";
            document.getElementById('step1').style.border = "2px";
            document.getElementById('step1').style.fontWeight = "normal";
            document.getElementById('step2').style.background = "Yellow";
            document.getElementById('step2').style.border = "2px solid White";
            document.getElementById('step2').style.fontWeight = "bold";
            if (draw.active) {
                draw.deactivate();
                }
            map.removeControl(panel);
            panelActivation(panel2, [del2, draw2]);
            draw2.activate();
            feedback = "Step 1 completed <br />&nbsp;&nbsp;&nbsp;&nbsp;" + count + " fear of crime point(s) added.<br />";
            document.getElementById("feedbackHead").innerHTML = "<center><strong>User Feedback</strong></center><br />";
            document.getElementById("feedbackBody").innerHTML = feedback;
            document.getElementById("instrucHead").innerHTML = "<strong>Instructions to Step 2</strong>";
            document.getElementById("instrucBody").innerHTML = "<strong>Mark the locations where you feel unsafe walking at night</strong> by clicking on the map to the left.<br /> Click on at least one location!";
            step = 2;
        }
    }

    function step2to3() {
        count = testingPoints2();
        if (count != 0) {
            document.getElementById('step2').style.background = "Green";
            document.getElementById('step2').style.border = "2px";
            document.getElementById('step2').style.fontWeight = "normal";
            document.getElementById('step3').style.background = "Yellow";
            document.getElementById('step3').style.border = "2px solid White";
            document.getElementById('step3').style.fontWeight = "bold";
            if (draw2.active) {
                draw2.deactivate();
            }
            map.removeControl(panel2);
            selectAreaUnit.activate();
            document.getElementById("notChristchurch").style.display = 'block';
            feedback += "Step 2 completed <br />&nbsp;&nbsp;&nbsp;&nbsp;" + count + " fear of crime night time point(s) added.<br />";
            document.getElementById("feedbackBody").innerHTML = feedback;
            document.getElementById("instrucHead").innerHTML = "<strong>Instructions to Step 3</strong>";
            document.getElementById("instrucBody").innerHTML = "<strong>Mark the area in which you live</strong> by clicking on the map to the left.<br /><br /> If you don't live in Christchurch please use this dropdown box to identify where you come from by selecting the smallest area, which includes your home";
            step = 3;
        }   
    }

    function step3to4() {
        if (testingAreaAdded()) {
            document.getElementById('step3').style.background = "Green";
            document.getElementById('step3').style.border = "2px";
            document.getElementById('step3').style.fontWeight = "normal";
            document.getElementById('step4').style.background = "Yellow";
            document.getElementById('step4').style.border = "2px solid White";
            document.getElementById('step4').style.fontWeight = "bold";
            if (selectAreaUnit.active) {
                selectAreaUnit.deactivate();
            }
            document.getElementById("notChristchurch").style.display = 'none';
            feedback += "Step 3 completed <br />&nbsp;&nbsp;&nbsp;&nbsp;" + suburb + " is the area of residence selected.<br />";
            document.getElementById("feedbackBody").innerHTML = feedback;
            document.getElementById("instrucHead").innerHTML = "<strong>Instructions to Step 4</strong>";
            document.getElementById("instrucBody").innerHTML = "<strong>Please fill out the questionaire - thanks</strong> <br />";
            document.getElementById("questionaire").style.display = 'block';
            document.getElementById("cloud").style.display = 'block';
            proceed.deactivate();
            step = 4;
        
            }
    
        }

    function finishOff() {
        //alert(qid);
        insertFromOverlay();
        //displayStatusLayer();        
        saveStrategy.save();     
    }

    function somethingsWrong() {
        alert("Something's wrong as we're outside the number of defined steps in this web application");
        }

    //!!THIS IS NOT USED AT THE MOMENT!!-CHECK IT UP - it is used - but should send user to a different site to view the entered points-yes yes yes
        function showSuccessMsg() {
            feedback += "Step 4 completed <br />&nbsp;&nbsp;&nbsp;&nbsp;The data was successfully submitted and will be a vital part of the Fear of Crime in Christchurch research.<br />";
            document.getElementById("feedbackBody").innerHTML = feedback;
            document.getElementById('step4').style.background = "Green";
            document.getElementById('step4').style.border = "2px";
            document.getElementById('step4').style.fontWeight = "normal";
            document.getElementById("questionaire").style.display = 'none';
            document.getElementById("cloud").style.display = 'none';
            document.getElementById("instrucHead").innerHTML = "<strong>Thanks for your contribution!</strong>";
            document.getElementById("instrucBody").innerHTML = "<strong>See which Fear of Crime points has been added by all contributers at this stage and compare with your own points</strong> <br />";
            step = 0;
            selectAreaUnit.unselectAll();
            wfs_layer.visibility = true;
            wfs_layer.display(true);
            wfs_layer.redraw();
            pausecomp(1250);
            document.getElementById("cloud2").style.display = 'none';
            document.getElementById("submitting").style.display = 'none';
    };

    //!!THIS IS NOT USED AT THE MOMENT!!-CHECK IT UP
    function showFailureMsg() {
        alert("Your data did not transfer to the database - try to hit the submit button again. If it still doesn't work - please wait a while before hitting the submit button again. Sorry about the inconvinience");
        document.getElementById("cloud2").style.display = 'none';
        document.getElementById("submitting").style.display = 'none';
        //send it on to a different site to show the different collected crime points
    };



    
    //***********************************************************************************************
    //Toolbars, Panels, Tools and Buttons
    //************************************************************************************************

    var submitButtonPanel = new OpenLayers.Control.Panel(
        {div: document.getElementById("panel"), displayClass : "submitButtonPanel" }
        );

        var submit = new OpenLayers.Control.Button({
            title: "Submit",
            trigger: function() {
                if (this.active) {
                    //                if (edit.feature) {
                    //                    edit.selectControl.unselectAll();
                    //                }
                    if (test()) {
                        count = testingPoints();
                        count2 = testingPoints2();
                        if (count != 0 && count2 != 0) {
                            //displayStatusOverlay();
                            //displayStatusLayer();
                            document.getElementById("cloud2").style.display = 'block';
                            document.getElementById("submitting").style.display = 'block';
                            postQuestionnaire();
                            //now the rest is handled by the finishOff() function which will be
                            //called when qid is set in postQuestionnaire()
                        }


                        /*saveStrategy.save();*/
                        //which is initialised on the wfs_layer (not the wfs_overlay)
                        //alert('saved');
                    }
                }
                else { this.activate(); }


            },
            displayClass: "buttonSubmit"
        });

    var proceedButtonPanel = new OpenLayers.Control.Panel(
        { div: document.getElementById("proceedPanel"), displayClass: "proceedButtonPanel" }
        );

        var proceed = new OpenLayers.Control.Button({
            title: "Proceed",
            trigger: function() {
                if (this.active) {
                    //                if (edit.feature) {
                    //                    edit.selectControl.unselectAll();
                    //                }
                    if (step == 1) {
                        step1to2();
                    }
                    else if (step == 2) {
                        step2to3();
                    }
                    else if (step == 3) {
                        step3to4();
                    }
                    else if (step == 4) {
                        finishOff();
                    }
                    else {
                        somethingsWrong();
                    }
                    /*saveStrategy.save();*/
                    //which is initialised on the wfs_layer (not the wfs_overlay)
                    //alert('saved');

                }
                else { this.activate(); }
            },
            displayClass: "buttonProceed"
        });


    function selectedAreaUnit(event) {
        if (document.getElementById("suburb").value != "null") {
            document.getElementById("suburb").value = "null";
            }
        suburb = areaUnit_layer.selectedFeatures[0].attributes.name;
//        //clear out the log's contents
//        document.getElementById('map_feature_log').innerHTML = '';
//        //Show the current selected feature (passed in from the
//        event object)
//        var display_text = 'Clicked on: '
//        + '<strong>' + event.feature.attributes.location + '</
//        strong>'
//        + ': ' + event.feature.attributes.description + '<hr
//        />';
//        document.getElementById('map_feature_log').innerHTML =
//        display_text;
//        //Show all the selected features
//        document.getElementById('map_feature_log').innerHTML += 'All
//        selected features: ';
//        //Now, loop through the selected feature array
//        for(var i=0; i<vector_layer.selectedFeatures.length; i++){
//        document.getElementById('map_feature_log').innerHTML
//        +=
//        vector_layer.selectedFeatures[i].attributes.
//        location + ' | ';
//        }
        }
    
    function unselectedAreaUnit(event){
        suburb = ''; //the value of the suburb variable gets nulled
//        var display_text = event.feature.attributes.location + '
//        unselected!' + '<hr />';
//        document.getElementById('map_feature_log').innerHTML =
//        display_text;
//        //Show all the selected features
//        document.getElementById('map_feature_log').innerHTML += 'All
//        selected features: ';
//        //Now, loop through the selected feature array
//        for(var i=0; i<vector_layer.selectedFeatures.length; i++){
//        document.getElementById('map_feature_log').innerHTML
//        +=
//        vector_layer.selectedFeatures[i].attributes.
//        location + ' | ';
//        }
        }

areaUnit_layer.events.register('featureselected', this, selectedAreaUnit);
areaUnit_layer.events.register('featureunselected', this, unselectedAreaUnit);

document.getElementById("suburb").onchange = function() {
    outsideChristchurch();
}

function outsideChristchurch() {
    if (document.getElementById("suburb").value != "null") {
        if (areaUnit_layer.selectedFeatures.length != 0) {    
            selectAreaUnit.unselect(areaUnit_layer.selectedFeatures[0]);
            //selectAreaUnit.unselectAll();
            //selectAreaUnit.deactivate();
            //selectAreaUnit.activate();
        }
            suburb = document.getElementById("suburb").value;
    }
    else {
        if (areaUnit_layer.selectedFeatures.length != 0) {
            selectAreaUnit.unselectAll(); //probably not necesary as it shouldn't be possible that any thing is selected on the map
            }
        suburb = '';
    }
}    
    
    
    var panel = new OpenLayers.Control.Panel(
        { displayClass: "customEditingToolbar" }
        );


    var panel2 = new OpenLayers.Control.Panel(
        {  displayClass: "customEditingToolbar" }
        );


    var navigate = new OpenLayers.Control.Navigation({
        title: "Pan Map"
        });

    var draw = new OpenLayers.Control.DrawFeature(
        wfs_overlay, OpenLayers.Handler.Point,
        {
        title: "Draw Feature",
        displayClass: "olControlDrawFeaturePolygon"
    });

    draw.events.register('featureadded',draw,testAddedFeature);

    var draw2 = new OpenLayers.Control.DrawFeature(
        wfs_overlay2, OpenLayers.Handler.Point,
        {
            title: "Draw Feature",
            displayClass: "olControlDrawFeaturePolygon"
        });

    draw2.events.register('featureadded', draw2, testAddedFeature2);

    function testAddedFeature() {
        feature = wfs_overlay.features[wfs_overlay.features.length - 1];
        if (!chch_area_extent.contains(feature.geometry.x,feature.geometry.y)){
                wfs_overlay.features.pop();
                alert("You can't add points outside the Christchurch Area - We'll now take you back to the Christchurch Area");
                map.zoomToExtent(mapextent);
            }
        }

        function testAddedFeature2() {
            feature = wfs_overlay2.features[wfs_overlay2.features.length - 1];
            if (!chch_area_extent.contains(feature.geometry.x, feature.geometry.y)) {
                wfs_overlay2.features.pop();
                alert("You can't add points outside the Christchurch Area - We'll now take you back to the Christchurch Area");
                map.zoomToExtent(mapextent);
            }
        }

        
    //skipping the edit/move functionality - still implemented as the submit button wouldn't work otherwise????
    var edit = new OpenLayers.Control.ModifyFeature(wfs_overlay, {
        title: "Modify Feature",
        displayClass: "olControlModifyFeature"
        });

    var del = new DeleteFeature(wfs_overlay, { title: "Delete Feature" });

    var del2 = new DeleteFeature(wfs_overlay2, { title: "Delete Feature" });

    var save = new OpenLayers.Control.Button({
        title: "Save Changes",
        trigger: function() {
            if (edit.feature) {
                edit.selectControl.unselectAll();
            }
            if (test()) {
                //have to make a change here if the save button is ever going into business again - which is not likely
                if (testingPoints()) {
                    insertFromOverlay();
                    saveStrategy.save();      //which is initialised on the wfs_layer (not the wfs_overlay)
                }
            }
        },
        displayClass: "olControlSaveFeatures"
    });

//exploring the selection control for use to select the area where the user lives
    var selectAreaUnit = new OpenLayers.Control.SelectFeature(areaUnit_layer, {
        multiple: false,
        toggle:true
        //multipleKey:'shiftKey'
        });
        //still exploring the above - now the catching the selection event and do something with the data

//panelActivation(panel2, [del2, draw2]);
//draw2.activate();
//if (draw2.active) {
//    draw2.deactivate();
//}
//map.removeControl(panel2);


panelActivation(panel, [del, draw]);
draw.activate();

//if (draw.active) {
//    draw.deactivate();
//}
//map.removeControl(panel);



    //add all the buttons to the panels and the panels to the map
    //panel.addControls([del, draw]);
    submitButtonPanel.addControls([submit]);
    proceedButtonPanel.addControls([proceed]);
    //panel.defaultControl = draw; // what is happening here??? shouldn't it be "draw" as navigate isn't even added to the panel
    //map.addControl(panel);
    //panel.deactivate();

    //add all the buttons to the panels and the panels to the map
    //panel2.addControls([del2, draw2]);
    //submitButtonPanel.addControls([submit]);
    //panel2.defaultControl = draw2; // what is happening here??? shouldn't it be "draw" as navigate isn't even added to the panel
    //map.addControl(panel2);
    //panel2.destroy();

    map.addControl(submitButtonPanel);
    map.addControl(proceedButtonPanel);
    //adding the select featureControl to the map - how is this going to work in conjunction with the drawing tool???
    //I guess we won't activate it until we have added the points of fear - or the other way round - we won't activate 
    //the draw (points of fear) tool until the users location???? - what if the users location is outside Chch???
    map.addControl(selectAreaUnit);
    //selectAreaUnit.activate();  //- it has n't been activate yet - has to deactivate other tool first
    //draw.activate();
    proceed.activate();
    submit.activate();
  
}