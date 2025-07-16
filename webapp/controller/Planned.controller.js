sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/routing/History"
], function(
	Controller, JSONModel, MessageToast, Filter, FilterOperator, DateFormat, History
) {
	"use strict";

	return Controller.extend("ZSHOPFLOOR_PM.controller.Planned", {

		onInit: function() {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("PlannedFilterSelect").attachPatternMatched(this._onRouteMatched, this);
			oRouter.getRoute("PlannedFiltered").attachPatternMatched(this._onRouteMatched, this);

			const oFilterModel = new JSONModel({
				hasData: false,
				totalRecords: 0,
				filteredRecords: 0,
				filtersExpanded: false,
				filterType: "month",
				selectedTab: "",
				yearTabs: ["2021", "2022", "2023", "2024", "2025"]
			});
			this.getView().setModel(oFilterModel, "filterModel");

			// ✅ Set default tab directly like production controller
			oFilterModel.setProperty("/filterType", "month");
			oFilterModel.setProperty("/selectedTab", "06"); // Jun by default
		},

		_onRouteMatched: function(oEvent) {
			const args = oEvent.getParameter("arguments");
			const filterType = args.filterType || "month";
			const filterValue = args.filterValue || (filterType === "month" ? "06" : "2025");
			const plantCode = args.plantId;
			this._plantCode = plantCode;

			const oFilterModel = this.getView().getModel("filterModel");
			oFilterModel.setProperty("/filterType", filterType);
			oFilterModel.setProperty("/selectedTab", filterValue);

			this._loadPlannedOrders(filterType, filterValue, plantCode);
		},

		onTabSelect: function(oEvent) {
			const key = oEvent.getParameter("key");
			this.getView().getModel("filterModel").setProperty("/selectedTab", key);
			this._loadPlannedOrders("month", key, this._plantCode);
		},

		onYearTabSelect: function(oEvent) {
			const key = oEvent.getParameter("key");
			this.getView().getModel("filterModel").setProperty("/selectedTab", key);
			this._loadPlannedOrders("year", key, this._plantCode);
		},

		_loadPlannedOrders: function(filterType, value, plantCode) {
			const oModel = this.getOwnerComponent().getModel();
			const that = this;
			const aFilters = [];

			if (plantCode) {
				aFilters.push(new Filter("Plantcode", FilterOperator.EQ, plantCode));
			}
			if (filterType === "month") {
				aFilters.push(new Filter("StartMonth", FilterOperator.EQ, value));
			} else {
				aFilters.push(new Filter("StartYear", FilterOperator.EQ, value));
			}

			oModel.read("/ShopPlanSet", {
				filters: aFilters,
				success: function(oData) {
					const aResults = oData.results || [];
					that.getView().setModel(new JSONModel({
						results: aResults
					}), "plannedModel");

					const oFilterModel = that.getView().getModel("filterModel");
					oFilterModel.setProperty("/hasData", aResults.length > 0);
					oFilterModel.setProperty("/totalRecords", aResults.length);
					oFilterModel.setProperty("/filteredRecords", aResults.length);
				},
				error: function() {
					MessageToast.show("Failed to fetch planned orders");
				}
			});
		},

		formatDate: function(sValue) {
			if (!sValue) return "";
			const oFormat = DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			return oFormat.format(new Date(sValue));
		},

		formatStatusState: function(sStatus) {
			if (sStatus === "Active") return "Success";
			if (sStatus === "Closed") return "Warning";
			return "None";
		},

		onNavBack: function() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash) {
				window.history.back();
			} else {
				this.getOwnerComponent().getRouter().navTo("Dashboard");
			}
		}
	});
});