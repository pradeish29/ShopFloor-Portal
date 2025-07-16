sap.ui.define([

	"sap/ui/core/UIComponent",

	"sap/ui/model/json/JSONModel"

], function(UIComponent, JSONModel) {

	"use strict";

	return UIComponent.extend("ZSHOPFLOOR_PM.Component", {

		metadata: {

			manifest: "json"

		},

		init: function() {

			UIComponent.prototype.init.apply(this, arguments);

			// Set user model

			this.setModel(new JSONModel({}), "userModel");

			// Set app model

			this.setModel(new JSONModel({
				busy: false
			}), "appModel");

			// Initialize router

			this.getRouter().initialize();

		},

		// Used in Login controller to save user session

		setUserSession: function(oData) {

			this.getModel("userModel").setData(oData);

		},

		// Used to clear user session

		clearUserSession: function() {

			this.getModel("userModel").setData({});

		}

	});

});