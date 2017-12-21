"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var builder = require("botbuilder");
var Apis_1 = require("./Apis");
var transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];
exports.SearchTime = new builder.Library('SearchTime');
exports.SearchTime.dialog('SearchTime', [
    function (session, args, next) {
        if (!args.loop) {
            var originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
            var destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
            var transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');
            console.log(transportModeEntity);
            session.userData.searchParams = {
                origin: originEntity ? originEntity.entity : null,
                destination: destinationEntity ? destinationEntity.entity : null,
                transportMode: transportModeEntity ? Apis_1.transport_mode_gmaps.indexOf(transportModeEntity.resolution.values[0]) : null
            };
            console.log(session.userData.searchParams);
        }
        if (!session.userData.searchParams.origin) {
            builder.Prompts.text(session, " D'o\u00F9 voulez vous partir ? ");
        }
        else if (!session.userData.searchParams.destination) {
            builder.Prompts.text(session, " O\u00F9 voulez vous aller ? ");
        }
        else if (session.userData.searchParams.transportMode == null) {
            builder.Prompts.choice(session, " Quel moyen de transport souhaitez vous utiliser ? ", transport_mode_verbose, { listStyle: builder.ListStyle.button });
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        console.log("@@" + JSON.stringify(results));
        var asked = false;
        console.log(JSON.stringify(session.userData));
        if (!session.userData.searchParams.origin) {
            session.userData.searchParams.origin = results.response;
            asked = true;
        }
        if (!session.userData.searchParams.destination) {
            if (asked) {
                session.replaceDialog('SearchTime', { loop: true });
            }
            else {
                session.userData.searchParams.destination = results.response;
                asked = true;
            }
        }
        if (session.userData.searchParams.transportMode == null) {
            if (asked) {
                session.replaceDialog('SearchTime', { loop: true });
            }
            else {
                session.userData.searchParams.transportMode = Apis_1.transport_mode_gmaps[results.response.index];
                next();
            }
        }
        if (!asked) {
            next();
        }
    },
    function (session, next) { return __awaiter(_this, void 0, void 0, function () {
        var params, response, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = session.userData.searchParams;
                    return [4 /*yield*/, Apis_1.Apis.getDuration(params.origin, params.destination, params.transportMode)];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        output = "Il vous faudra " + response.duration;
                        session.send(output);
                    }
                    session.endDialog();
                    return [2 /*return*/];
            }
        });
    }); }
]).triggerAction({
    matches: "SearchTime"
});
