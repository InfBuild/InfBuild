declare var resources: Resources;

$(() =>
{
	const setAutoFixedPartsHeader = () =>
	{
		let partsHeader = $("#parts-header");
		let parts = $("#parts");
		let partsCategorized = $("#parts-categorized");
		let parameters = $("#parameters");

		let updateFixedPartsHeader = () =>
		{
			let isSplitScreen = $(window).width() > 960;
			let scrollTop = (isSplitScreen ? parameters : $(window)).scrollTop();
			let partsTop = parts[0].offsetTop;
			let partsHeight = parts.height();
			let headerHeight = partsHeader.height();

			if (scrollTop > partsTop && scrollTop < headerHeight + partsTop + partsHeight)
			{
				partsCategorized.css("margin-top", headerHeight + "px");
				partsHeader.addClass("fixed").css("top", Math.min(0, partsTop + partsHeight - scrollTop - headerHeight - 8) + "px");
			}
			else
			{
				partsCategorized.css("margin-top", "");
				partsHeader.removeClass("fixed").css("top", "");
			}
		};

		$(window).on("scroll", updateFixedPartsHeader).on("resize", updateFixedPartsHeader);
		parameters.on("scroll", updateFixedPartsHeader);
	};
	const showDialogFromHash = () =>
	{
		if (!location.hash)
		{
			$(".dialog").addClass("hidden");

			return false;
		}

		let dialog = $("#" + location.hash.substr(1));

		if (dialog.length == 0 &&
			!dialog.hasClass("dialog"))
		{
			$(".dialog").addClass("hidden");
		
			return false;
		}

		dialog.removeClass("hidden");

		return true;
	};

	let app = window["app"] = new AppViewModel(resources, !showDialogFromHash());

	$(".dialog").on("click", () => history.back());
	$(".dialog > *").on("click", () => false);
	$(window).on("hashchange", () => showDialogFromHash() || app.loadHash());
	setAutoFixedPartsHeader();
	ko.applyBindings(app);
});