sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function(Controller) {
  "use strict";

  return Controller.extend("ZSHOPFLOOR_PM.controller.APP", {
    onInit: function () {
      // Initialize the router
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.initialize();

      // Optional: navigate to Login explicitly
      // Not strictly needed because manifest default route ("") is Login
      // Uncomment below if you want to force it:
      // oRouter.navTo("Login");
    }
  });
});