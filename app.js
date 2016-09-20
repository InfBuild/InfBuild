var AircraftCodeViewModel = (function () {
    function AircraftCodeViewModel(app) {
        this.app = app;
        this.code = null;
        ko.track(this);
    }
    AircraftCodeViewModel.prototype.showText = function () {
        var _this = this;
        $('#text-output').val(this.app.calculators.map(function (_) { return _.toDetailString(_this.app.language == "en"); }).join("\n\n"));
        $('#text').toggleClass('visible');
    };
    AircraftCodeViewModel.prototype.hideText = function () {
        $('#text').removeClass('visible');
    };
    return AircraftCodeViewModel;
}());
var AircraftSet = (function () {
    function AircraftSet(name, codes) {
        this.name = name;
        this.codes = codes;
    }
    AircraftSet.loadSets = function () {
        try {
            if (!window.localStorage["aircraftSets"])
                return [];
            else
                return JSON.parse(window.localStorage["aircraftSets"]);
        }
        catch (err) {
            return null;
        }
    };
    AircraftSet.saveSets = function (sets) {
        window.localStorage["aircraftSets"] = JSON.stringify(sets);
    };
    return AircraftSet;
}());
var AircraftSetsViewModel = (function () {
    function AircraftSetsViewModel(app) {
        var _this = this;
        this.app = app;
        this.sets = AircraftSet.loadSets();
        this.selectedSet = null;
        this.setSaveName = null;
        ko.track(this);
        ko.getObservable(this, "selectedSet").subscribe(function (_) {
            if (_this.selectedSet)
                _this.setSaveName = _this.selectedSet.name;
        });
    }
    Object.defineProperty(AircraftSetsViewModel.prototype, "isEnabled", {
        get: function () {
            return this.sets != null;
        },
        enumerable: true,
        configurable: true
    });
    AircraftSetsViewModel.prototype.load = function () {
        var _this = this;
        this.app.reset(this.selectedSet.codes.map(function (_) { return Calculator.load(_this.app.resources, _); }));
        this.hideLoad();
    };
    AircraftSetsViewModel.prototype.save = function () {
        var set = new AircraftSet(this.setSaveName, this.app.calculators.map(function (_) { return _.save(); }));
        if (this.selectedSet)
            this.sets.splice(this.sets.indexOf(this.selectedSet), 1, set);
        else
            this.sets.push(set);
        this.selectedSet = set;
        AircraftSet.saveSets(this.sets);
        this.hideSave();
    };
    AircraftSetsViewModel.prototype.remove = function () {
        if (this.selectedSet) {
            this.sets.remove(this.selectedSet);
            AircraftSet.saveSets(this.sets);
        }
    };
    AircraftSetsViewModel.prototype.showLoad = function () {
        this.hideSave();
        $('#load-aircraftset').toggleClass('visible');
    };
    AircraftSetsViewModel.prototype.hideLoad = function () {
        $('#load-aircraftset').removeClass('visible');
    };
    AircraftSetsViewModel.prototype.showSave = function () {
        this.hideLoad();
        $('#save-aircraftset').toggleClass('visible');
        $('#save-aircraftset-name').focus();
    };
    AircraftSetsViewModel.prototype.hideSave = function () {
        $('#save-aircraftset').removeClass('visible');
    };
    return AircraftSetsViewModel;
}());
var AppViewModel = (function () {
    function AppViewModel(resources, loadHash) {
        if (loadHash === void 0) { loadHash = true; }
        this.resources = resources;
        this.aircraftSets = new AircraftSetsViewModel(this);
        this.code = new AircraftCodeViewModel(this);
        this.language = "ja";
        this.selectingAircraft = false;
        this.selectedCalculator = null;
        this.selectedPartsCategory = "Current";
        this.calculators = [];
        this.enemies = [ko.observableArray(), ko.observableArray()];
        this._selectedStage = null;
        loadHash && this.loadHash() || this.reset();
        ko.track(this);
    }
    AppViewModel.prototype.reset = function (calculators) {
        if (calculators === void 0) { calculators = null; }
        this.calculators.splice(0, this.calculators.length);
        if (calculators)
            (_a = this.calculators).push.apply(_a, calculators);
        if (this.calculators.length == 0)
            this.addCalculator();
        else
            this.selectedCalculator = this.calculators[0];
        var _a;
    };
    AppViewModel.prototype.loadHash = function () {
        var _this = this;
        if (!location.hash && !location.search)
            return false;
        (_a = this.calculators).splice.apply(_a, [0, this.calculators.length].concat((location.hash || location.search).substr(1).split(/-/g).map(function (_) { return Calculator.load(_this.resources, _); })));
        this.selectedCalculator = this.calculators[0];
        return true;
        var _a;
    };
    AppViewModel.prototype.updateHash = function () {
        var code = "#" + this.calculators.map(function (_) { return _.save(); }).join("-");
        if (window.history.replaceState && location.hash != code)
            window.history.replaceState(null, null, "" + this.getAbsoluteUrl() + code);
    };
    AppViewModel.prototype.getAbsoluteUrl = function () {
        var href = location.href;
        if (location.hash)
            href = href.slice(0, -location.hash.length);
        if (location.search)
            href = href.slice(0, -location.search.length);
        return href;
    };
    AppViewModel.prototype.tweet = function () {
        var code = "#" + this.calculators.map(function (_) { return _.save(); }).join("-");
        window.open("https://twitter.com/intent/tweet?text=&hashtags=" + encodeURIComponent("infbuild") + "&url=" + encodeURIComponent(this.getAbsoluteUrl() + code), "_blank");
    };
    Object.defineProperty(AppViewModel.prototype, "aircraftName", {
        get: function () {
            return this.selectedCalculator.aircraft.name;
        },
        set: function (value) {
            if (!value)
                return;
            var aircraft = this.resources.aircraftList.byKey(value);
            if (aircraft) {
                this.selectedRole = aircraft.role;
                this.selectedCalculator.aircraft = aircraft;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "aircraftsByRole", {
        get: function () {
            var _this = this;
            return this.resources.aircraftList.filter(function (_) { return _.role == _this.selectedRole; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedRole", {
        get: function () {
            return this.selectedCalculator.aircraft.role;
        },
        set: function (value) {
            if (value != null && this.selectedCalculator.aircraft.role != value)
                this.selectedCalculator.aircraft = this.resources.aircraftList.filter(function (_) { return _.role == value; })[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedStage", {
        get: function () {
            return this._selectedStage;
        },
        set: function (value) {
            this._selectedStage = value;
            this.updateEnemies();
        },
        enumerable: true,
        configurable: true
    });
    AppViewModel.prototype.updateEnemies = function () {
        var _this = this;
        var _loop_1 = function(i) {
            this_1.enemies[i].removeAll();
            (_a = this_1.enemies[i]).push.apply(_a, this_1.resources.enemyList.filter(function (_) { return _.role == i && _.isInStage(_this.selectedStage); }).sort(function (x, y) { return _this.getHitPoint(x) - _this.getHitPoint(y); }));
        };
        var this_1 = this;
        for (var i = 0; i < this.enemies.length; i++) {
            _loop_1(i);
        }
        var _a;
    };
    AppViewModel.prototype.setParts = function (parts, addOrRemove) {
        if (addOrRemove && this.selectedCalculator.parts.length >= 7 ||
            !addOrRemove && this.selectedCalculator.parts.length <= 0)
            return false;
        if (addOrRemove)
            this.selectedCalculator.parts.push(parts);
        else
            this.selectedCalculator.parts.remove(parts);
        return true;
    };
    Object.defineProperty(AppViewModel.prototype, "partsByCategory", {
        get: function () {
            var _this = this;
            return this.selectedPartsCategory == "Current" ? this.selectedCalculator.parts : this.resources.partsList.filter(function (_) { return _.category == _this.selectedPartsCategory.toUpperCase(); });
        },
        enumerable: true,
        configurable: true
    });
    AppViewModel.prototype.getHitPoint = function (enemy) {
        return enemy.getHitPoint(this.selectedStage, this.selectedRole, this.resources);
    };
    AppViewModel.prototype.getHitPointClass = function (enemy) {
        var hp = this.getHitPoint(enemy);
        return hp > 2500 ? null : hp > 2000 ? "dmg-d2400" : hp > 1600 ? "dmg-d2000" : hp > 1400 ? "dmg-d1600" : null;
    };
    AppViewModel.prototype.getDamageClass = function (dmg) {
        return dmg >= 2400 ? "dmg-d2400" : dmg >= 2000 ? "dmg-d2000" : dmg >= 1600 ? "dmg-d1600" : null;
    };
    AppViewModel.prototype.getGaugeLength = function (enemies, damage) {
        var _this = this;
        return enemies().filter(function (_) { return damage + 20 > _this.getHitPoint(_); }).length * 20 + "px";
    };
    AppViewModel.prototype.getGauges = function (calculator, role, type, gauge) {
        gauge++;
        var empty = {
            length: "0",
            text: "",
            damage: 0
        };
        var weapon = [
            calculator.mainWeapon,
            calculator.specialWeapon,
            calculator.specialWeapon,
            calculator.specialWeapon
        ][type];
        if (!weapon)
            return empty;
        var damageSource = [
            calculator.result.main,
            calculator.result.special,
            calculator.result.specialStrong,
            calculator.result.specialWeak,
        ][type];
        if (!damageSource)
            return empty;
        var damage = damageSource[[
            "airDamage",
            "groundDamage"
        ][role]] * gauge;
        var rate = damageSource[[
            "airRate",
            "groundRate"
        ][role]];
        var isUncertain = damageSource[[
            "isAirRateUncertain",
            "isGroundRateUncertain"
        ][role]];
        this.updateHash();
        return {
            length: this.getGaugeLength(this.enemies[role], damage),
            text: gauge > 1
                ? "x" + gauge
                : type < 2
                    ? weapon.name + " <b class=\"" + this.getDamageClass(damage) + "\">" + damage + "</b> <b class=\"note " + (isUncertain ? "uncertain" : "") + "\">" + rate + "</b>"
                    : "" + weapon.name + "+-"[type - 2] + " <b class=\"" + this.getDamageClass(damage) + "\">" + damage + "</b> <b class=\"note\">" + (type == 2 ? "×" + weapon.strongMultiplier : "÷" + weapon.weakDivider) + "</b>",
            damage: damage
        };
    };
    AppViewModel.prototype.getGaugeClass = function (calculator, role, type, gauge) {
        var weapon = [
            calculator.mainWeapon,
            calculator.specialWeapon,
            calculator.specialWeapon,
            calculator.specialWeapon
        ][type];
        return [
            ["results-gauge-msl", "results-gauge-spw", "results-gauge-strong", "results-gauge-weak"][type],
            gauge > 0 ? "results-gauge-multi" : null,
            weapon.role != SpecialWeaponRole.Other && weapon.role != role ? "results-gauge-none" : null
        ].join(" ");
    };
    AppViewModel.prototype.getEnemyColor = function (enemy) {
        return "enemy-" + ["y", "o", "r", "tgt"][enemy.color];
    };
    AppViewModel.prototype.getEnemySpecialEffetcs = function (enemy) {
        var _this = this;
        return [
            enemy.weakAgainst
                ? enemy.weakAgainst.filter(function (_) { return _this.calculators.some(function (c) { return c.specialWeapon.name == _; }); })
                    .map(function (_) { return ("<span class=\"enemy-strong\">" + _ + "+</span>"); }).join(" ")
                : null,
            enemy.strongAgainst
                ? enemy.strongAgainst.filter(function (_) { return _this.calculators.some(function (c) { return c.specialWeapon.name == _; }); })
                    .map(function (_) { return ("<span class=\"enemy-weak\">" + _ + "-</span>"); }).join(" ")
                : null
        ].filter(function (_) { return _ != null; }).join(" ");
    };
    AppViewModel.prototype.addCalculator = function () {
        var _this = this;
        var calc = new Calculator(this.resources);
        ko.getObservable(calc, "aircraft").subscribe(function (_) { return _this.updateEnemies(); });
        this.calculators.push(calc);
        this.selectedCalculator = calc;
    };
    AppViewModel.prototype.removeCalculator = function () {
        if (this.calculators.length <= 1)
            return;
        var idx = this.calculators.indexOf(this.selectedCalculator);
        this.calculators.remove(this.selectedCalculator);
        this.selectedCalculator = this.calculators[Math.max(0, idx - 1)];
    };
    AppViewModel.version = 20160916;
    AppViewModel.revision = 0;
    return AppViewModel;
}());
var Calculator = (function () {
    function Calculator(resources) {
        this.resources = resources;
        this.aircraft = null;
        this.level = 1;
        this.extendedSlots = null;
        this.specialWeapon = null;
        this.specialWeaponLevel = 1;
        this.parts = [];
        this.datalink = null;
        this.criticalActive = false;
        this.aircraft = resources.aircraftList.byKey("F-4E");
        this.specialWeapon = this.aircraft.specialWeapons[0];
        this.datalink = resources.datalinkList[0];
        ko.track(this);
    }
    Calculator.getRoundedFloat = function (n) {
        return parseFloat(n.toPrecision(Calculator.precision));
    };
    Object.defineProperty(Calculator.prototype, "leveledAircraftCost", {
        get: function () {
            var table = this.aircraft.costTable;
            var acst = Math.max(0, table[0] * Math.min(this.level - 1, 9)) +
                Math.max(0, table[1] * Math.min(this.level - 10, 5)) +
                Math.max(0, table[2] * Math.min(this.level - 15, 1)) +
                Math.max(0, table[3] * (this.level - 16));
            return this.aircraft.cost + acst;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "totalCost", {
        get: function () {
            return this.leveledAircraftCost +
                this.specialWeapon.costs[this.specialWeaponLevel - 1] +
                this.parts.reduce(function (x, y) { return x + y.cost; }, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "totalEquipCost", {
        get: function () {
            var _this = this;
            return this.parts.reduce(function (x, y) { return x + y.getPrice(_this.aircraft); }, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "realLevel", {
        get: function () {
            if (this.aircraft.role == AircraftRole.Bomber) {
                var mgpb = this.resources.specialWeaponList.byKey("MGPB");
                return Calculator.getRoundedFloat(mgpb.levelRate1 + mgpb.levelRateAdditionPerLevel * (this.level - 1));
            }
            else
                return this.level > 15
                    ? 13 + (this.level - 15) * 0.25
                    : this.level > 11
                        ? 11 + (this.level - 11) * 0.5
                        : this.level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "realSpecialWeaponLevel", {
        get: function () {
            return Calculator.getRoundedFloat(this.specialWeapon == null ? 1 : this.specialWeapon.levelRate1 + this.specialWeapon.levelRateAdditionPerLevel * (this.specialWeaponLevel - 1));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "slotUsage", {
        get: function () {
            var _this = this;
            return [PartsSlot.Body, PartsSlot.Arms, PartsSlot.Misc].map(function (c) {
                return _this.parts.filter(function (_) { return _.slot == c; }).reduce(function (x, y) { return x + y.slotUsage; }, 0);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "levelAddedSlots", {
        get: function () {
            return (this.level >= 6 ? 2 : 0) + (this.level >= 15 ? 1 : 0) + (this.level >= 20 ? 1 : 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "extraSlots", {
        get: function () {
            var ex = parseInt(this.extendedSlots);
            return (ex || 0) + this.levelAddedSlots;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "maxSlots", {
        get: function () {
            var _this = this;
            return this.aircraft.slots.map(function (_) { return Math.min(_ + _this.extraSlots, Calculator.maxExtendedSlots + _this.levelAddedSlots); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "mainWeapon", {
        get: function () {
            return this.aircraft.mainWeapon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Calculator.prototype, "result", {
        get: function () {
            var critical = this.datalink && this.datalink.id == 2 && this.criticalActive ? 1 : 0;
            var cost = this.aircraft.cost + this.aircraft.cost % 50 + this.aircraft.handicap * 50;
            var special = this.specialWeapon.getResult(this.aircraft.role, cost, this.realSpecialWeaponLevel + critical, this.parts);
            var specialStrong = this.specialWeapon.strongMultiplier;
            var specialWeak = this.specialWeapon.weakDivider;
            var rt = {
                main: this.mainWeapon.getResult(this.aircraft.role, cost, this.realLevel + critical, this.parts),
                special: special,
                specialStrong: specialStrong ? special.multiply(specialStrong) : null,
                specialWeak: specialWeak ? special.divide(specialWeak) : null,
            };
            if (this.specialWeapon.relatedDamage) {
                var sp = this.specialWeapon;
                do {
                    var rel = this.resources.specialWeaponList.byKey(sp.relatedDamage);
                    var relDamage = rel.getResult(this.aircraft.role, cost, rel.levelRate1 + rel.levelRateAdditionPerLevel * (this.specialWeaponLevel - 1) + critical, []);
                    rt.special.airDamage += relDamage.airDamage * rel.numberOfGauges;
                    rt.special.groundDamage += relDamage.groundDamage * rel.numberOfGauges;
                    sp = rel;
                } while (sp.relatedDamage);
            }
            return rt;
        },
        enumerable: true,
        configurable: true
    });
    Calculator.load = function (resources, code) {
        var rt = new Calculator(resources);
        rt.loadCore(code);
        return rt;
    };
    Calculator.prototype.loadCore = function (code) {
        var version = parseInt(code.substr(0, 2), 36);
        if (version != Calculator.codeVersion)
            throw "invalid version";
        var codebody = code.substr(2);
        if (codebody.length % 2 != 0)
            throw "invalid length";
        var parts = [];
        this.datalink = this.resources.datalinkList[0];
        for (var i = 0; i * 2 < codebody.length; i++) {
            var value = parseInt(codebody.substr(i * 2, 2), 36);
            switch (i) {
                case 0:
                    var a = value == 0 ? null : this.resources.aircraftList.byId(value - 1);
                    if (!a)
                        throw "invalid aircraft";
                    this.aircraft = a;
                    break;
                case 1:
                    if (value < Calculator.levelRange[0] ||
                        value > Calculator.levelRange[1])
                        throw "invalid aircraft level";
                    this.level = value;
                    break;
                case 2:
                    this.extendedSlots = value;
                    break;
                case 3:
                    var s = value == 0 ? null : this.resources.specialWeaponList.byId(value - 1);
                    if (!s)
                        throw "invalid special weapon";
                    this.specialWeapon = s;
                    break;
                case 4:
                    if (value < Calculator.specialWeaponLevelRange[0] ||
                        value > Calculator.specialWeaponLevelRange[1])
                        throw "invalid special weapon level";
                    this.specialWeaponLevel = value;
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                    var p = this.resources.partsList.byId(value);
                    if (p && !~parts.indexOf(p))
                        parts.push(p);
                    break;
                case 12:
                    this.datalink = this.resources.datalinkList.byId(value);
                    break;
            }
        }
        this.parts = parts;
    };
    Calculator.prototype.save = function () {
        var version = ("0" + Calculator.codeVersion.toString(36)).substr(-2);
        var codebody = [
            this.aircraft == null ? 0 : this.aircraft.id + 1,
            this.level,
            parseInt(this.extendedSlots),
            this.specialWeapon == null ? 0 : this.specialWeapon.id + 1,
            this.specialWeaponLevel,
        ]
            .concat(this.parts.concat([null, null, null, null, null, null, null]).slice(0, 7).map(function (_) { return _ ? _.id : 0; }))
            .concat([this.datalink ? this.datalink.id : 0])
            .map(function (_) { return ("0" + (_ || 0).toString(36)).substr(-2); })
            .join("");
        return version + codebody;
    };
    Calculator.prototype.toString = function () {
        return this.aircraft.name + " Lv." + this.level + " " + this.specialWeapon.name + " Lv." + this.specialWeaponLevel;
    };
    Calculator.prototype.toDetailString = function (isEnglish) {
        return [
            (this.aircraft.name + " Lv." + this.level + " " + this.specialWeapon.name + " Lv." + this.specialWeaponLevel),
            "CODE: " + this.save(),
            ("BODY: " + this.slotUsage[0] + "/" + this.maxSlots[0] + ", ARMS: " + this.slotUsage[1] + "/" + this.maxSlots[1] + ", MISC: " + this.slotUsage[2] + "/" + this.maxSlots[2] + (this.extendedSlots > 0 ? " (+" + this.extendedSlots + ")" : "")),
        ]
            .concat(this.parts.filter(function (_) { return _.id > 0; }).map(function (_) { return isEnglish ? _.englishName : _.name; }))
            .concat([!this.datalink ? "" : isEnglish ? this.datalink.englishName : this.datalink.name]).join("\r\n");
    };
    Calculator.codeVersion = 1;
    Calculator.precision = 5;
    Calculator.levelRange = [1, 20];
    Calculator.specialWeaponLevelRange = [1, 5];
    Calculator.maxExtendedSlots = 38;
    return Calculator;
}());
var Resources = (function () {
    function Resources(aircraftList, specialWeaponList, partsList, enemyList, datalinkList, stageList) {
        this.aircraftList = aircraftList;
        this.specialWeaponList = specialWeaponList;
        this.partsList = partsList;
        this.enemyList = enemyList;
        this.datalinkList = datalinkList;
        this.stageList = stageList;
    }
    return Resources;
}());
var Aircraft = (function () {
    function Aircraft() {
    }
    Aircraft.fromJsonObject = function (specialWeaponList, index, obj) {
        var rt = new Aircraft();
        for (var i in obj)
            if (i == "mainWeapon")
                rt.mainWeapon = specialWeaponList.byKey(obj[i]);
            else if (i == "specialWeapons")
                rt.specialWeapons = obj[i].map(specialWeaponList.byKey);
            else if (i == "role")
                rt.role = AircraftRole.parse(obj[i]);
            else
                rt[i] = obj[i];
        rt.index = index;
        return rt;
    };
    return Aircraft;
}());
var AircraftRole;
(function (AircraftRole) {
    AircraftRole[AircraftRole["Fighter"] = 0] = "Fighter";
    AircraftRole[AircraftRole["Multirole"] = 1] = "Multirole";
    AircraftRole[AircraftRole["Attacker"] = 2] = "Attacker";
    AircraftRole[AircraftRole["Bomber"] = 3] = "Bomber";
    AircraftRole[AircraftRole["PistonFighter"] = 4] = "PistonFighter";
})(AircraftRole || (AircraftRole = {}));
var AircraftRole;
(function (AircraftRole) {
    function parse(str) {
        switch (str) {
            case "F":
                return AircraftRole.Fighter;
            case "M":
                return AircraftRole.Multirole;
            case "A":
                return AircraftRole.Attacker;
            case "B":
                return AircraftRole.Bomber;
            case "PF":
                return AircraftRole.PistonFighter;
            default:
                throw new Error("Invalid AircraftRole: " + str);
        }
    }
    AircraftRole.parse = parse;
})(AircraftRole || (AircraftRole = {}));
var SpecialWeapon = (function () {
    function SpecialWeapon() {
        this.airRate = [];
        this.isAirRateUncertain = [];
        this.groundRate = [];
        this.isGroundRateUncertain = [];
    }
    SpecialWeapon.fromJsonObject = function (index, obj) {
        var rt = new SpecialWeapon();
        for (var i in obj)
            if (i == "role")
                rt.role = SpecialWeaponRole.parse(obj[i]);
            else
                rt[i] = obj[i];
        rt.index = index;
        return rt;
    };
    SpecialWeapon.prototype.getResult = function (role, baseCost, level, parts) {
        var _this = this;
        return new DamageSet((this.fixedBaseCost ? this.fixedBaseCost : baseCost) + (level + parts.filter(function (_) { return _.isSupported(role, _this); }).reduce(function (x, y) { return x + y.power; }, 0)) * 50, this.airRate[role], this.isAirRateUncertain[role], this.groundRate[role], this.isGroundRateUncertain[role]);
    };
    return SpecialWeapon;
}());
var SpecialWeaponRole;
(function (SpecialWeaponRole) {
    SpecialWeaponRole[SpecialWeaponRole["ToAir"] = 0] = "ToAir";
    SpecialWeaponRole[SpecialWeaponRole["ToGround"] = 1] = "ToGround";
    SpecialWeaponRole[SpecialWeaponRole["Other"] = 2] = "Other";
})(SpecialWeaponRole || (SpecialWeaponRole = {}));
var SpecialWeaponRole;
(function (SpecialWeaponRole) {
    function parse(str) {
        switch (str) {
            case "A":
                return SpecialWeaponRole.ToAir;
            case "G":
                return SpecialWeaponRole.ToGround;
            case "O":
                return SpecialWeaponRole.Other;
            default:
                throw new Error("Invalid SpecialWeaponRole: " + str);
        }
    }
    SpecialWeaponRole.parse = parse;
})(SpecialWeaponRole || (SpecialWeaponRole = {}));
var Parts = (function () {
    function Parts() {
    }
    Parts.fromJsonObject = function (index, obj) {
        var rt = new Parts();
        for (var i in obj)
            if (i == "slot")
                rt.slot = PartsSlot.parse(obj[i]);
            else if (i == "supportedRoles")
                rt.supportedRoles = obj[i] ? obj[i].map(AircraftRole.parse) : null;
            else
                rt[i] = obj[i];
        rt.index = index;
        return rt;
    };
    Object.defineProperty(Parts.prototype, "isWeaponParts", {
        get: function () {
            return this.category == "MSL" || this.category.indexOf("SP.") == 0;
        },
        enumerable: true,
        configurable: true
    });
    Parts.prototype.getPrice = function (aircraft) {
        return this.cost == 0 ? 0 : Math.ceil(this.cost / 15) * aircraft.equipCost;
    };
    Parts.prototype.isSupported = function (role, specialWeapon) {
        return (!this.supportedRoles || ~this.supportedRoles.indexOf(role))
            && (!this.isWeaponParts || (this.supportedWeapons
                ? ~this.supportedWeapons.indexOf(specialWeapon.name)
                : this.category == specialWeapon.category));
    };
    return Parts;
}());
var PartsSlot;
(function (PartsSlot) {
    PartsSlot[PartsSlot["Body"] = 0] = "Body";
    PartsSlot[PartsSlot["Arms"] = 1] = "Arms";
    PartsSlot[PartsSlot["Misc"] = 2] = "Misc";
})(PartsSlot || (PartsSlot = {}));
var PartsSlot;
(function (PartsSlot) {
    function parse(str) {
        switch (str) {
            case "BODY":
                return PartsSlot.Body;
            case "ARMS":
                return PartsSlot.Arms;
            case "MISC":
                return PartsSlot.Misc;
            default:
                throw new Error("Invalid PartsSlot: " + str);
        }
    }
    PartsSlot.parse = parse;
})(PartsSlot || (PartsSlot = {}));
var Enemy = (function () {
    function Enemy() {
    }
    Enemy.fromJsonObject = function (stageList, _index, obj) {
        var rt = new Enemy();
        for (var i in obj)
            if (i == "role")
                rt.role = EnemyRole.parse(obj[i]);
            else if (i == "color")
                rt.color = EnemyColor.parse(obj[i]);
            else if (i == "stages")
                rt.stages = obj[i].map(function (_) { return stageList.byKey(_); });
            else
                rt[i] = obj[i];
        var nameidx = rt.name.indexOf("(");
        if (nameidx >= 0)
            rt.name = rt.name.substr(0, nameidx - 1) + "<span class=\"enemy-name\">" + rt.name.substr(nameidx - 1) + "</span>";
        rt.isDefaultHidden = rt.stages.every(function (_) { return _.isSpecialRaid || _.isHard; });
        return rt;
    };
    Enemy.prototype.isInStage = function (stage) {
        return !stage && !this.isDefaultHidden
            || stage && (~this.stages.indexOf(stage) || stage.originalStage && this.stages.some(function (_) { return _.key == stage.originalStage; }));
    };
    Enemy.prototype.getHitPoint = function (stage, aircraftRole, resources, convertSoftTarget) {
        if (convertSoftTarget === void 0) { convertSoftTarget = false; }
        var rt = this.hitPoint;
        if (stage && stage.isHard)
            rt *= this.hardMultiplier || 1.2;
        if (convertSoftTarget && this.isSoftTarget) {
            var msl = resources.specialWeaponList.byKey("MSL");
            var rates = [msl.airRate, msl.groundRate][this.role];
            rt = Calculator.getRoundedFloat(rt * (rates[aircraftRole] / rates[0]));
        }
        return rt;
    };
    return Enemy;
}());
var EnemyRole;
(function (EnemyRole) {
    EnemyRole[EnemyRole["Air"] = 0] = "Air";
    EnemyRole[EnemyRole["Ground"] = 1] = "Ground";
})(EnemyRole || (EnemyRole = {}));
var EnemyRole;
(function (EnemyRole) {
    function parse(str) {
        switch (str) {
            case "A":
                return EnemyRole.Air;
            case "G":
                return EnemyRole.Ground;
            default:
                throw new Error("Invalid EnemyRole: " + str);
        }
    }
    EnemyRole.parse = parse;
})(EnemyRole || (EnemyRole = {}));
var EnemyColor;
(function (EnemyColor) {
    EnemyColor[EnemyColor["Yellow"] = 0] = "Yellow";
    EnemyColor[EnemyColor["Orange"] = 1] = "Orange";
    EnemyColor[EnemyColor["Red"] = 2] = "Red";
    EnemyColor[EnemyColor["Target"] = 3] = "Target";
    EnemyColor[EnemyColor["Y"] = 0] = "Y";
    EnemyColor[EnemyColor["O"] = 1] = "O";
    EnemyColor[EnemyColor["R"] = 2] = "R";
    EnemyColor[EnemyColor["TGT"] = 3] = "TGT";
})(EnemyColor || (EnemyColor = {}));
var EnemyColor;
(function (EnemyColor) {
    function parse(str) {
        switch (str) {
            case "Y":
                return EnemyColor.Yellow;
            case "O":
                return EnemyColor.Orange;
            case "R":
                return EnemyColor.Red;
            case "TGT":
                return EnemyColor.Target;
            default:
                throw new Error("Invalid EnemyColor: " + str);
        }
    }
    EnemyColor.parse = parse;
})(EnemyColor || (EnemyColor = {}));
var Datalink = (function () {
    function Datalink() {
    }
    Datalink.fromJsonObject = function (index, obj) {
        var rt = new Datalink();
        for (var i in obj)
            rt[i] = obj[i];
        rt.index = index;
        return rt;
    };
    return Datalink;
}());
var Stage = (function () {
    function Stage() {
    }
    Stage.fromJsonObject = function (index, obj) {
        var rt = new Stage();
        for (var i in obj)
            rt[i] = obj[i];
        rt.index = index;
        return rt;
    };
    return Stage;
}());
var DamageSet = (function () {
    function DamageSet(totalCost, airRate, isAirRateUncertain, groundRate, isGroundRateUncertain) {
        this.totalCost = totalCost;
        this.airRate = airRate;
        this.isAirRateUncertain = isAirRateUncertain;
        this.groundRate = groundRate;
        this.isGroundRateUncertain = isGroundRateUncertain;
        this.airDamage = Math.ceil(totalCost * airRate);
        this.groundDamage = Math.ceil(totalCost * groundRate);
    }
    DamageSet.prototype.multiply = function (rate) {
        return new DamageSet(this.totalCost, Calculator.getRoundedFloat(this.airRate * rate), this.isAirRateUncertain, Calculator.getRoundedFloat(this.groundRate * rate), this.isGroundRateUncertain);
    };
    DamageSet.prototype.divide = function (rate) {
        return new DamageSet(this.totalCost, Calculator.getRoundedFloat(this.airRate / rate), this.isAirRateUncertain, Calculator.getRoundedFloat(this.groundRate / rate), this.isGroundRateUncertain);
    };
    return DamageSet;
}());
$(function () {
    var setAutoFixedPartsHeader = function () {
        var partsHeader = $("#parts-header");
        var parts = $("#parts");
        var partsCategorized = $("#parts-categorized");
        var parameters = $("#parameters");
        var updateFixedPartsHeader = function () {
            var isSplitScreen = $(window).width() > 960;
            var scrollTop = (isSplitScreen ? parameters : $(window)).scrollTop();
            var partsTop = parts[0].offsetTop;
            var partsHeight = parts.height();
            var headerHeight = partsHeader.height();
            if (scrollTop > partsTop && scrollTop < headerHeight + partsTop + partsHeight) {
                partsCategorized.css("margin-top", headerHeight + "px");
                partsHeader.addClass("fixed").css("top", Math.min(0, partsTop + partsHeight - scrollTop - headerHeight - 8) + "px");
            }
            else {
                partsCategorized.css("margin-top", "");
                partsHeader.removeClass("fixed").css("top", "");
            }
        };
        $(window).on("scroll", updateFixedPartsHeader).on("resize", updateFixedPartsHeader);
        parameters.on("scroll", updateFixedPartsHeader);
    };
    var showDialogFromHash = function () {
        if (!location.hash) {
            $(".dialog").addClass("hidden");
            return false;
        }
        var dialog = $("#" + location.hash.substr(1));
        if (dialog.length == 0 &&
            !dialog.hasClass("dialog")) {
            $(".dialog").addClass("hidden");
            return false;
        }
        dialog.removeClass("hidden");
        return true;
    };
    var app = window["app"] = new AppViewModel(resources, !showDialogFromHash());
    $(".dialog").click(function (e) {
        if (e.target != e.currentTarget)
            return true;
        history.back();
        return false;
    });
    $(window).on("hashchange", function () { return showDialogFromHash() || app.loadHash(); });
    setAutoFixedPartsHeader();
    ko.applyBindings(app);
});
/// <reference path="../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../node_modules/@types/knockout.es5/index.d.ts" />
var Version = (function () {
    function Version() {
    }
    Object.defineProperty(Version, "version", {
        get: function () {
            var date = Version.publishDate || new Date();
            return date.getUTCFullYear().toString().substr(2)
                + ("0" + (date.getUTCMonth() + 1)).slice(-2)
                + ("0" + date.getUTCDate()).slice(-2)
                + "-"
                + ("0" + date.getUTCHours()).slice(-2)
                + ("0" + date.getUTCMinutes()).slice(-2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Version, "variant", {
        get: function () {
            return [Version.etc, Version.publishDate ? null : "dev"].filter(function (_) { return _ != null; }).join("-");
        },
        enumerable: true,
        configurable: true
    });
    Version.publishDate = null;
    Version.etc = null;
    return Version;
}());
//# sourceMappingURL=app.js.map