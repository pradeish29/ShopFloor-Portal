sap.ui.define([
"sap/ui/core/mvc/Controller",
"sap/ui/model/json/JSONModel",
"sap/ui/model/Filter",
"sap/ui/model/FilterOperator",
"sap/ui/core/format/DateFormat",
"sap/ui/core/routing/History"
], function (
Controller, JSONModel, Filter, FilterOperator, DateFormat, History
) {
"use strict";

return Controller.extend("ZSHOPFLOOR_PM.controller.Production", {

onInit: function () {
  const oRouter = this.getOwnerComponent().getRouter();
  oRouter.getRoute("ProductionFilterSelect").attachPatternMatched(this._onRouteMatched, this);
  oRouter.getRoute("ProductionFiltered").attachPatternMatched(this._onRouteMatched, this);

  const oFilterModel = new JSONModel({
    hasData: false,
    totalRecords: 0,
    filterType: "month",
    selectedTab: "",
    yearTabs: ["2021", "2022", "2023", "2024", "2025"]
  });
  this.getView().setModel(oFilterModel, "filterModel");

  // Set both month and year defaults explicitly
  oFilterModel.setProperty("/filterType", "month");
  oFilterModel.setProperty("/selectedTab", "06"); // Jun by default
},

_onRouteMatched: function (oEvent) {
  const args = oEvent.getParameter("arguments");
  const filterType = args.filterType || "month";
  const filterValue = args.filterValue || (filterType === "month" ? "06" : "2025");
  const plantCode = args.plantId;

  this._plantCode = plantCode;

  const oFilterModel = this.getView().getModel("filterModel");
  oFilterModel.setProperty("/filterType", filterType);
  oFilterModel.setProperty("/selectedTab", filterValue);

  this._loadProductionOrders(filterType, filterValue, plantCode);
},

onTabSelect: function (oEvent) {
  const key = oEvent.getParameter("key");
  this.getView().getModel("filterModel").setProperty("/selectedTab", key);
  this._loadProductionOrders("month", key, this._plantCode);
},

onYearTabSelect: function (oEvent) {
  const key = oEvent.getParameter("key");
  this.getView().getModel("filterModel").setProperty("/selectedTab", key);
  this._loadProductionOrders("year", key, this._plantCode);
},

_loadProductionOrders: function (filterType, value, plantCode) {
  const oModel = this.getOwnerComponent().getModel();
  const that = this;
  const aFilters = [new Filter("Plantcode", FilterOperator.EQ, plantCode)];

  if (filterType === "month") {
    aFilters.push(new Filter("StartMonth", FilterOperator.EQ, value));
  } else if (filterType === "year") {
    aFilters.push(new Filter("StartYear", FilterOperator.EQ, value));
  }

  oModel.read("/ShopProductSet", {
    filters: aFilters,
    success: function (oData) {
      const results = oData.results || [];
      that.getView().setModel(new JSONModel({ results }), "productionModel");

      const oFilterModel = that.getView().getModel("filterModel");
      oFilterModel.setProperty("/hasData", results.length > 0);
      oFilterModel.setProperty("/totalRecords", results.length);

      that.byId("tableContainer")?.setVisible(results.length > 0);
      that.byId("noDataContainer")?.setVisible(results.length === 0);
    },
    error: function (err) {
      console.error("❌ Failed to load production orders", err);
    }
  });
},

formatDate: function (sDate) {
  if (!sDate) return "";
  const match = sDate.match?.(/\/Date\((\d+)\)\//);
  const timestamp = match ? parseInt(match[1], 10) : Date.parse(sDate);
  if (!timestamp || isNaN(timestamp)) return "";
  const oFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
  return oFormat.format(new Date(timestamp));
},

formatStatusState: function (status) {
  if (status === "Active") return "Success";
  if (status === "Closed") return "Warning";
  return "None";
},

onNavBack: function () {
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