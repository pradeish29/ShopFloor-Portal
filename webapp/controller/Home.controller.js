sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/GenericTile",
	"sap/m/TileContent",
	"sap/m/FeedContent"
], function (
	Controller,
	JSONModel,
	MessageToast,
	GenericTile,
	TileContent,
	FeedContent
) {
	"use strict";

	return Controller.extend("ZSHOPFLOOR_PM.controller.Home", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel(); // Default OData model
			var that = this;

			oModel.read("/ShopPlantSet", {
				success: function (oData) {
					that._renderPlantTiles(oData.results || []);
				},
				error: function () {
					MessageToast.show("❌ Failed to load plant data.");
				}
			});
		},

		_renderPlantTiles: function (aPlants) {
			var oContainer = this.byId("plantContainer");
			oContainer.removeAllItems();

			var that = this;

			aPlants.forEach(function (oPlant) {
				var oTile = new GenericTile({
					header: oPlant.Name1,
					subheader: oPlant.Name2 || oPlant.Ort01,
					press: function () {
						that._navigateToDashboard(oPlant.Werks, oPlant.Name1);
					},
					tileContent: [
						new TileContent({
							content: new FeedContent({
								contentText: oPlant.Ort01 + ", " + oPlant.Land1,
								value: oPlant.Pstlz || "",
								valueColor: "Neutral"
							})
						})
					]
				});

				oContainer.addItem(oTile);
			});
		},

		_navigateToDashboard: function (sWerks, sName1) {
			var oRouter = this.getOwnerComponent().getRouter();

			MessageToast.show("✅ Selected: " + sName1);

			oRouter.navTo("Dashboard", {
				plantId: sWerks
				// plantName: encodeURIComponent(sName1)
			});
		}
	});
});
