sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("ZSHOPFLOOR_PM.controller.Dashboard", {
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Dashboard").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var sPlantId = oEvent.getParameter("arguments").plantId;
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.read("/ShopPlantSet", {
				filters: [new Filter("Werks", FilterOperator.EQ, sPlantId)],
				success: function(oData) {
					if (oData.results && oData.results.length > 0) {
						var oPlant = oData.results[0];

						console.log("✔ Plant Data Loaded:", oPlant); // For Debugging

						var oOrderModel = new JSONModel({
							results: [oPlant]
						});
						that.getView().setModel(oOrderModel, "orderModel");

						var oPlantModel = new JSONModel({
							companyName: oPlant.Name1 || "Company Name",
							plantCode: oPlant.Werks
						});
						that.getView().setModel(oPlantModel, "plantModel");

					} else {
						MessageToast.show("❌ No plant found for Werks = " + sPlantId);
					}
				},
				error: function(oError) {
					MessageToast.show("Error loading plant data.");
					console.error("ShopPlantSet read error:", oError);
				}
			});
		},

		onBackToDashboard: function() {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home"); // Navigate back to login page
		},

		onLogoutPress: function() {
			const oRouter = this.getOwnerComponent().getRouter();

			// Optional: clear any session model or authentication flags
			const oAppModel = this.getOwnerComponent().getModel("appModel");
			if (oAppModel) {
				oAppModel.setProperty("/isLoggedIn", false);
				oAppModel.setProperty("/userData", null);
			}

			sap.m.MessageToast.show("Logging out...");
			oRouter.navTo("Login");
		},

		onPlanYearPress: function() {
			var sPlantId = this.getView().getModel("plantModel").getProperty("/plantCode");
			this.getOwnerComponent().getRouter().navTo("PlannedFilterSelect", {
				plantId: sPlantId,
				filterType: "year"
			});
		},

		onPlanMonthPress: function() {
			var sPlantId = this.getView().getModel("plantModel").getProperty("/plantCode");
			this.getOwnerComponent().getRouter().navTo("PlannedFilterSelect", {
				plantId: sPlantId,
				filterType: "month"
			});
		},

		onProdYearPress: function() {
			var sPlantId = this.getView().getModel("plantModel").getProperty("/plantCode");
			this.getOwnerComponent().getRouter().navTo("ProductionFilterSelect", {
				plantId: sPlantId,
				filterType: "year"
			});
		},

		onProdMonthPress: function() {
			var sPlantId = this.getView().getModel("plantModel").getProperty("/plantCode");
			this.getOwnerComponent().getRouter().navTo("ProductionFilterSelect", {
				plantId: sPlantId,
				filterType: "month"
			});
		}

	});
});