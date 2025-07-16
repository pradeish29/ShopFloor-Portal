sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("ZSHOPFLOOR_PM.controller.Login", {

		onInit: function() {
			// Clear any previous user session (optional)
			if (this.getOwnerComponent().clearUserSession) {
				this.getOwnerComponent().clearUserSession();
			}
		},

		onLoginPress: function() {
			var userId = this.byId("userIdInput").getValue().trim();
			var password = this.byId("passwordInput").getValue().trim();

			if (!userId || !password) {
				MessageToast.show("Please enter both User ID and Password.");
				return;
			}

			this._setLoginState(true);
			this._performODataLogin(userId, password);
		},

		_performODataLogin: function(userId, password) {
			var oModel = this.getView().getModel(); // OData model from manifest
			var that = this;

			var payload = {
				EMP_ID: userId,
				PASSWORD: password
			};

			oModel.create("/ShopLoginSet", payload, {
				success: function(oData) {
					that._setLoginState(false);

					if (oData.RETURN && oData.RETURN.toLowerCase().includes("successful")) {
						MessageToast.show("Login Successful");

						// Save session info
						if (that.getOwnerComponent().setUserSession) {
							that.getOwnerComponent().setUserSession({
								empId: oData.EMP_ID,
								loginMessage: oData.RETURN
							});
						}

						// Navigate to Dashboard and clear history (no back to login)
						// that.getOwnerComponent().getRouter().navTo("Dashboard", {}, true);
						that.getOwnerComponent().getRouter().navTo("Home");
						
						// Delay field clear until nav completes
						setTimeout(function() {
							that.byId("userIdInput").setValue("");
							that.byId("passwordInput").setValue("");
						}, 300);
					} else {
						MessageToast.show("Invalid credentials or login failed.");
					}
				},
				error: function(oError) {
					that._setLoginState(false);
					console.error("Login OData error:", oError);
					MessageToast.show("Login service error. Please try again.");
				}
			});
		},

		_setLoginState: function(bBusy) {
			var oButton = this.byId("loginButton");

			if (oButton) {
				oButton.setEnabled(!bBusy);
				oButton.setText(bBusy ? "Logging in..." : "Login");
			}

			var oAppModel = this.getOwnerComponent().getModel("appModel");
			if (oAppModel) {
				oAppModel.setProperty("/busy", bBusy);
			}
		}

	});
});