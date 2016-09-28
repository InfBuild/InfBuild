import * as React from "react";
import { render } from "react-dom";
import App from "./App";
import Version from "./Version";
import Aircraft from "./Data/Aircraft";
import Datalink from "./Data/Datalink";
import Enemy from "./Data/Enemy";
import Parts from "./Data/Parts";
import SpecialWeapon from "./Data/SpecialWeapon";
import Stage from "./Data/Stage";
import Resources from "./Data/Resources";

const resources: Resources = window["initializeResources"](Resources, Aircraft, SpecialWeapon, Parts, Enemy, Datalink, Stage);
const version: Version = (window["initializeVersion"] || (() => new Version()))(Version);

const renderContent = () =>
	render(
		<App version={version} resources={resources} hash={location.hash} />,
		document.getElementById("container"),
		() => document.getElementById("loading").classList.add("hidden")
	);

window.onhashchange = renderContent;
renderContent();
